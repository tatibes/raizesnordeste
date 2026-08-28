import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function ensureUnidade(data: {
  nome: string;
  endereco: string;
  ativa: boolean;
}) {
  const existing = await prisma.unidade.findFirst({ where: { nome: data.nome } });
  return existing ?? prisma.unidade.create({ data });
}

async function ensureProdutos(
  unidadeId: bigint,
  produtos: Array<{
    nome: string;
    descricao: string;
    categoria: string;
    precoBase: number;
    quantidadeEstoque: number;
  }>
) {
  for (const produtoData of produtos) {
    const existing = await prisma.produto.findFirst({
      where: { unidadeId, nome: produtoData.nome }
    });
    const produto = existing ?? await prisma.produto.create({
      data: {
        nome: produtoData.nome,
        descricao: produtoData.descricao,
        categoria: produtoData.categoria,
        precoBase: produtoData.precoBase,
        unidadeId
      }
    });

    await prisma.estoqueUnidade.upsert({
      where: { unidadeId_produtoId: { unidadeId, produtoId: produto.id } },
      update: {},
      create: {
        unidadeId,
        produtoId: produto.id,
        quantidade: produtoData.quantidadeEstoque
      }
    });
  }
}

async function ensureUsuario(data: {
  nome: string;
  email: string;
  senha: string;
  perfil: 'ADMIN' | 'CLIENTE';
}) {
  const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existing) {
    if (!existing.senha.includes(':')) {
      return prisma.usuario.update({
        where: { id: existing.id },
        data: { senha: await hashPassword(data.senha), ativo: true }
      });
    }
    return existing;
  }

  return prisma.usuario.create({
    data: {
      ...data,
      senha: await hashPassword(data.senha),
      ativo: true
    }
  });
}

async function main() {
  console.log('Starting full database seeding...');

  console.log('Preenchendo (unidades)');

  const recife = await ensureUnidade({
    nome: 'Raízes Recife - Marco Zero',
    endereco: 'Praça Rio Branco, S/N - Recife Antigo, Recife - PE',
    ativa: true,
  });

  const salvador = await ensureUnidade({
    nome: 'Raízes Salvador - Pelourinho',
    endereco: 'Largo do Pelourinho, 12 - Centro Histórico, Salvador - BA',
    ativa: true,
  });

  const fortaleza = await ensureUnidade({
    nome: 'Raízes Fortaleza - Beira Mar',
    endereco: 'Av. Beira Mar, 2500 - Meireles, Fortaleza - CE',
    ativa: true,
  });

  const natal = await ensureUnidade({
    nome: 'Raízes Natal - Ponta Negra',
    endereco: 'Av. Erivan França, 102 - Ponta Negra, Natal - RN',
    ativa: true,
  });

  console.log('Unidades criadas!');

  console.log('Preenchendo unidades com produtos e estoque Recife');
  const produtosRecife = [
    {
      nome: 'Baião de Dois Clássico',
      descricao: 'Feijão fradinho, arroz, queijo coalho grelhado, charque, bacon e coentro fresco.',
      categoria: 'Pratos Principais',
      precoBase: 35.90,
      quantidadeEstoque: 80,
    },
    {
      nome: 'Carne de Sol com Macaxeira',
      descricao: 'Carne de sol premium acebolada na manteiga de garrafa, acompanhada de macaxeira frita.',
      categoria: 'Pratos Principais',
      precoBase: 42.00,
      quantidadeEstoque: 65,
    },
    {
      nome: 'Cartola Pernambucana',
      descricao: 'Banana frita na manteiga de garrafa, queijo coalho assado, açúcar e canela em pó.',
      categoria: 'Sobremesas',
      precoBase: 15.00,
      quantidadeEstoque: 50,
    },
    {
      nome: 'Bolo de Rolo Tradicional',
      descricao: 'Fatia generosa de bolo de rolo pernambucano, massa fina recheada com goiabada cascão.',
      categoria: 'Sobremesas',
      precoBase: 12.50,
      quantidadeEstoque: 40,
    },
  ];

  await ensureProdutos(recife.id, produtosRecife);

   console.log('Preenchendo unidades com produtos e estoque Salvador');
  const produtosSalvador = [
    {
      nome: 'Moqueca Baiana de Peixe',
      descricao: 'Postas de peixe fresco cozidas em panela de barro com leite de coco, azeite de dendê, pimentões e coentro.',
      categoria: 'Pratos Principais',
      precoBase: 58.00,
      quantidadeEstoque: 50,
    },
    {
      nome: 'Acarajé do Pelô',
      descricao: 'Bolinho crocante de feijão fradinho frito no dendê, recheado com vatapá, caruru e camarão seco defumado.',
      categoria: 'Entradas',
      precoBase: 18.00,
      quantidadeEstoque: 100,
    },
    {
      nome: 'Caruru Tradicional',
      descricao: 'Gisado cremoso de quiabo com camarão seco, amendoim, castanha e azeite de dendê.',
      categoria: 'Entradas',
      precoBase: 22.00,
      quantidadeEstoque: 60,
    },
    {
      nome: 'Cocada Cremosa de Tabuleiro',
      descricao: 'Cocada mole servida morna com fitas de coco queimado e raspas frescas de limão.',
      categoria: 'Sobremesas',
      precoBase: 10.00,
      quantidadeEstoque: 45,
    },
  ];

  await ensureProdutos(salvador.id, produtosSalvador);

  console.log('Preenchendo unidades com produtos e estoque Fortaleza');
  const produtosFortaleza = [
    {
      nome: 'Peixada Cearense',
      descricao: 'Postas de peixe cozidas ao molho de leite de coco e legumes selecionados, ovos cozidos e pirão consistente.',
      categoria: 'Pratos Principais',
      precoBase: 48.00,
      quantidadeEstoque: 45,
    },
    {
      nome: 'Rubacão Arretado',
      descricao: 'Arroz cremoso cozido com feijão de corda, charque picadinho, queijo coalho e nata fresca da fazenda.',
      categoria: 'Pratos Principais',
      precoBase: 38.00,
      quantidadeEstoque: 70,
    },
    {
      nome: 'Caranguejada do Meireles',
      descricao: 'Caranguejos inteiros cozidos em caldo aromático temperado com leite de coco e cheiro verde.',
      categoria: 'Entradas',
      precoBase: 24.00,
      quantidadeEstoque: 55,
    },
    {
      nome: 'Cuscuz Nordestino com Queijo',
      descricao: 'Cuscuz de milho fofinho servido com queijo coalho grelhado e regado na manteiga de garrafa.',
      categoria: 'Entradas',
      precoBase: 14.00,
      quantidadeEstoque: 80,
    },
  ];

  await ensureProdutos(fortaleza.id, produtosFortaleza);
 console.log('Preenchendo unidades com produtos e estoque Natal');
  const produtosNatal = [
    {
      nome: 'Ginga com Tapioca',
      descricao: 'Tapioca de goma artesanal recheada com gingas (peixinhos) fritas inteiras e crocantes.',
      categoria: 'Entradas',
      precoBase: 16.00,
      quantidadeEstoque: 90,
    },
    {
      nome: 'Carne de Sol de Caicó',
      descricao: 'Legítima carne de sol assada na brasa, servida com feijão verde, macaxeira cozida e paçoca de pilão.',
      categoria: 'Pratos Principais',
      precoBase: 45.00,
      quantidadeEstoque: 60,
    },
    {
      nome: 'Paçoca de Pilão de Natal',
      descricao: 'Farofa crocante de carne de sol desfiada e socada com farinha de mandioca e cebola roxa.',
      categoria: 'Entradas',
      precoBase: 20.00,
      quantidadeEstoque: 75,
    },
    {
      nome: 'Suco de Caju do Maior do Mundo',
      descricao: 'Suco natural concentrado e refrescante, feito com os cajus nativos do RN.',
      categoria: 'Bebidas',
      precoBase: 8.00,
      quantidadeEstoque: 120,
    },
  ];

  await ensureProdutos(natal.id, produtosNatal);

  console.log('Preenchendo com usuarios de teste');
  const adminUser = await ensureUsuario({
    nome: 'Administrador do Sistema',
    email: 'admin@raizesnordeste.com',
    senha: 'adminsecret123',
    perfil: 'ADMIN'
  });

  const clienteUser = await ensureUsuario({
    nome: 'Maria Silva',
    email: 'maria@email.com',
    senha: 'mariasecret123',
    perfil: 'CLIENTE'
  });

  console.log(`Base de dados preenchida com sucesso!`);
  console.log(`4 Unidades`);
  console.log(`16 Produtos regionais cadastrados com seus estoques individualizados.`);
  console.log(`2 Usuários de teste (ADMIN: ${adminUser.email}, CLIENTE: ${clienteUser.email})`);
}

main()
  .catch((e) => {console.error('Erros durante o preenchimento da base de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
