import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { seedTestData } from './seed';
import { prisma } from '../src/database/prismaClient';

// Configura porta de teste antes de carregar o servidor
process.env.PORT = '3001';
process.env.JWT_SECRET = '77256de1-6faa-4dc0-a481-eb93fac29c39';

// Helper para assinar tokens JWT nativamente para teste
function generateTestToken(payload: any, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${headerB64}.${payloadB64}`);
  const signature = hmac.digest('base64url');

  return `${headerB64}.${payloadB64}.${signature}`;
}

test('Teste de integração - Raízes do Nordeste API', async (t) => {
  //Iniciar o servidor em iportando o arquivo do servidor
  console.log('Iniciando teste na porta 3001');
  require('../src/server');

  // Aguarda um tempo para garantir que o Express está pronto
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let ids: { unidadeId: number; produtoId: number; usuarioId: number };
  let token: string;

  await t.test('Preenchendo base de dados', async () => {
    ids = await seedTestData();
    assert.ok(ids.unidadeId, 'Unidade ID criado');
    assert.ok(ids.produtoId, 'Produto ID criado');
    assert.ok(ids.usuarioId, 'Usuario ID criado');

    // Gerar token de autenticação válido
    token = generateTestToken(
      { id: ids.usuarioId, perfil: 'CLIENTE', email: 'teste@example.com' },
      process.env.JWT_SECRET!
    );
  });

  await t.test('GET /health - Checagem Health', async () => {
    const response = await fetch('http://localhost:3001/health');
    assert.strictEqual(response.status, 200, 'Checagem health deve retornar 200 (ok)');
    const body = await response.json() as any;
    assert.strictEqual(body.status, 'OK', 'Status ok');
  });

  await t.test('GET /unidades/:unidadeId/produtos - Lista de produtos', async () => {
    const response = await fetch(`http://localhost:3001/unidades/${ids.unidadeId}/produtos`);
    assert.strictEqual(response.status, 200, 'Retorno 200');
    const body = await response.json() as any[];
    assert.ok(Array.isArray(body), 'Precisa ser um array');
    assert.ok(body.length > 0, 'Não pode salvar sem produtos');
    const firstProduct = body[0];
    assert.strictEqual(Number(firstProduct.unidadeId), ids.unidadeId, 'Produto atribuido a unidade correta');
  });

  await t.test('POST /pedidos - Ordem criada com sucesso', async () => {
    // Verificar estoque antes do pedido
    const estoqueAntes = await prisma.estoqueUnidade.findUnique({
      where: {
        unidadeId_produtoId: {
          unidadeId: ids.unidadeId,
          produtoId: ids.produtoId
        }
      }
    });
    assert.ok(estoqueAntes, 'Estoque precisa existir antes do pedido');
    const qtdAntes = estoqueAntes.quantidade;

    // Fazer pedido de 5 unidades
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        unidadeId: ids.unidadeId,
        canalPedido: 'APP',
        formaPagamento: 'PIX',
        itens: [
          { produtoId: ids.produtoId, quantidade: 5 }
        ]
      })
    });

    assert.strictEqual(response.status, 201, 'ORdem criada com sucesso deve retornar 201 ');
    const body = await response.json() as any;
    assert.ok(body.pedidoId, 'Retornar ID do pedido');
    assert.strictEqual(body.status, 'AGUARDANDO_PAGAMENTO', 'Status esperadod AGUARDANDO_PAGAMENTO');
    assert.strictEqual(body.total, 35.50 * 5, 'Preço total calculado corretamente');

    // Verificar estoque depois do pedido
    const estoqueDepois = await prisma.estoqueUnidade.findUnique({
      where: {
        unidadeId_produtoId: {
          unidadeId: ids.unidadeId,
          produtoId: ids.produtoId
        }
      }
    });
    assert.strictEqual(estoqueDepois!.quantidade, qtdAntes - 5, 'Diminuiu o estoque em 5');

    // Verificar auditoria
    const auditLog = await prisma.logAuditoria.findFirst({
      where: {
        usuarioId: ids.usuarioId,
        acao: 'CRIAR_PEDIDO'
      },
      orderBy: { timestamp: 'desc' }
    });
    assert.ok(auditLog, 'Log criado para ação de criar pedido');
    const detalhes = auditLog.detalhes as any;
    assert.strictEqual(detalhes.canal, 'APP', 'Log deve capturar o canal do pedido');
    assert.strictEqual(detalhes.recurso, `/pedidos/${body.pedidoId}`, 'Log deve capturar o caminho do recurso');
  });

  await t.test('POST /pedidos - Falha pataforma invalida', async () => {
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        unidadeId: ids.unidadeId,
        canalPedido: 'INVALID_CANAL',
        formaPagamento: 'PIX',
        itens: [
          { produtoId: ids.produtoId, quantidade: 1 }
        ]
      })
    });

    assert.strictEqual(response.status, 400, 'Deve retornar 400 Bad Request');
    const body = await response.json() as any;
    assert.strictEqual(body.error, 'CANAL_INVALIDO', 'Código de erro deve ser CANAL_INVALIDO');
  });

  await t.test('POST /pedidos - Falha no estoque insuficiente', async () => {
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        unidadeId: ids.unidadeId,
        canalPedido: 'APP',
        formaPagamento: 'PIX',
        itens: [
          { produtoId: ids.produtoId, quantidade: 9999 } // excede o estoque de 95 restantes
        ]
      })
    });

    assert.strictEqual(response.status, 422, 'Deve retornar 422 Unprocessable Entity');
    const body = await response.json() as any;
    assert.strictEqual(body.error, 'ESTOQUE_INSUFICIENTE', 'Código de erro deve ser ESTOQUE_INSUFICIENTE');
  });

  await t.test('POST /pedidos - Ordem criada com canal PICKUP', async () => {
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        unidadeId: ids.unidadeId,
        canalPedido: 'PICKUP',
        formaPagamento: 'PIX',
        itens: [
          { produtoId: ids.produtoId, quantidade: 1 }
        ]
      })
    });

    assert.strictEqual(response.status, 201, 'Ordem criada com canal PICKUP deve retornar 201');
    const body = await response.json() as any;
    assert.strictEqual(body.canalPedido, 'PICKUP', 'O canal do pedido retornado deve ser PICKUP');
  });

  await t.test('GET /unidades/:unidadeId/pedidos - Listar todos os pedidos sem filtro', async () => {
    const response = await fetch(`http://localhost:3001/unidades/${ids.unidadeId}/pedidos`);
    assert.strictEqual(response.status, 200, 'Listar pedidos sem filtro deve retornar 200');
    const body = await response.json() as any[];
    assert.ok(Array.isArray(body), 'Deve retornar um array de pedidos');
    assert.ok(body.length >= 2, 'Deve conter pelo menos os dois pedidos criados');
  });

  await t.test('GET /unidades/:unidadeId/pedidos - Listar filtrando por canalPedido=PICKUP', async () => {
    const response = await fetch(`http://localhost:3001/unidades/${ids.unidadeId}/pedidos?canalPedido=PICKUP`);
    assert.strictEqual(response.status, 200, 'Listar pedidos com filtro PICKUP deve retornar 200');
    const body = await response.json() as any[];
    assert.ok(Array.isArray(body), 'Deve retornar um array de pedidos');
    assert.ok(body.length > 0, 'Deve retornar pelo menos o pedido com canal PICKUP');
    body.forEach(pedido => {
      assert.strictEqual(pedido.canalPedido, 'PICKUP', 'Todo pedido retornado com esse filtro deve ser PICKUP');
    });
  });

  await t.test('GET /unidades/:unidadeId/pedidos - Falha ao filtrar com canal inválido', async () => {
    const response = await fetch(`http://localhost:3001/unidades/${ids.unidadeId}/pedidos?canalPedido=CHURRASCARIA`);
    assert.strictEqual(response.status, 400, 'Filtrar canal inválido deve retornar 400');
    const body = await response.json() as any;
    assert.strictEqual(body.error, 'CANAL_INVALIDO', 'Código do erro deve ser CANAL_INVALIDO');
  });

  // Finalizar conexões do prisma e encerrar o processo de teste limpo
  await prisma.$disconnect();
  console.log('Todas os testes concluídos com sucesso!');
  process.exit(0);
});
