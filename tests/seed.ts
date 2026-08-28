// Tetes da base de dados no Prisma
import { prisma } from '../src/database/prismaClient';
import { hashPassword } from '../src/utils/password';

export async function seedTestData() {
  console.log('Iniciando base de dados de teste...');

  // Limpar registros em ordem para respeitar a integridade referencial do Prisma.
  await prisma.logAuditoria.deleteMany({ where: { acao: 'CRIAR_PEDIDO' } });
  await prisma.pagamento.deleteMany({});
  await prisma.itemPedido.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.estoqueUnidade.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.usuario.deleteMany({ where: { email: 'teste@exemplo.com.br' } });
  await prisma.unidade.deleteMany({ where: { nome: 'Unidade de Teste 1' } });

  //Criar Unidade
  const unidade = await prisma.unidade.create({
    data: {
      nome: 'Unidade de Teste 1',
      endereco: 'Rua de Teste, 123',
      ativa: true,
    }
  });
  console.log(`Criada Unidade ID: ${unidade.id}`);

  //Criar Produto
  const produto = await prisma.produto.create({
    data: {
      nome: 'Carne de Sol de Teste',
      descricao: 'Uma deliciosa carne de sol de teste',
      categoria: 'Prato Principal',
      precoBase: 35.50,
      unidadeId: unidade.id
    }
  });
  console.log(`Created Produto ID: ${produto.id}`);

  //Criar Estoque
  const estoque = await prisma.estoqueUnidade.create({
    data: {
      unidadeId: unidade.id,
      produtoId: produto.id,
      quantidade: 100 // estoque teste
    }
  });
  console.log(`Criado Estoque ID: ${estoque.id} com quantidade: ${estoque.quantidade}`);

  //Criar Usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Usuario Teste',
      email: 'teste@exemplo.com.br',
      senha: await hashPassword('testepassword123'),
      perfil: 'CLIENTE',
      ativo: true
    }
  });
  console.log(`Criado usuario ID: ${usuario.id}`);

  console.log('Teste base de dados criada com sucesso!');
  return {
    unidadeId: Number(unidade.id),
    produtoId: Number(produto.id),
    usuarioId: Number(usuario.id)
  };
}

if (require.main === module) {
  seedTestData().finally(() => prisma.$disconnect());
}
