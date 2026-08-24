import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database seeding...');

  //Limpar banco na ordem correta para respeitar FKs
  console.log( 'Clearing old data...');
  await prisma.logAuditoria.deleteMany({});
  await prisma.pagamento.deleteMany({});
  await prisma.itemPedido.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.estoqueUnidade.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.unidade.deleteMany({});
  await prisma.fidelidade.deleteMany({});
  await prisma.usuario.deleteMany({});

  console.log('Preenchendo (unidades)');

  const recife = await prisma.unidade.create({
    data: {
      nome: 'Raízes Recife - Marco Zero',
      endereco: 'Praça Rio Branco, S/N - Recife Antigo, Recife - PE',
      ativa: true,
    },
  });

  const salvador = await prisma.unidade.create({
    data: {
      nome: 'Raízes Salvador - Pelourinho',
      endereco: 'Largo do Pelourinho, 12 - Centro Histórico, Salvador - BA',
      ativa: true,
    },
  });

  const fortaleza = await prisma.unidade.create({
    data: {
      nome: 'Raízes Fortaleza - Beira Mar',
      endereco: 'Av. Beira Mar, 2500 - Meireles, Fortaleza - CE',
      ativa: true,
    },
  });

  const natal = await prisma.unidade.create({
    data: {
      nome: 'Raízes Natal - Ponta Negra',
      endereco: 'Av. Erivan França, 102 - Ponta Negra, Natal - RN',
      ativa: true,
    },
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

  for (const p of produtosRecife) {
    const produto = await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        categoria: p.categoria,
        precoBase: p.precoBase,
        unidadeId: recife.id,
      },
    });

    await prisma.estoqueUnidade.create({
      data: {
        unidadeId: recife.id,
        produtoId: produto.id,
        quantidade: p.quantidadeEstoque,
      },
    });
  }

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

  for (const p of produtosSalvador) {
    const produto = await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        categoria: p.categoria,
        precoBase: p.precoBase,
        unidadeId: salvador.id,
      },
    });

    await prisma.estoqueUnidade.create({
      data: {
        unidadeId: salvador.id,
        produtoId: produto.id,
        quantidade: p.quantidadeEstoque,
      },
    });
  }

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

  for (const p of produtosFortaleza) {
    const produto = await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        categoria: p.categoria,
        precoBase: p.precoBase,
        unidadeId: fortaleza.id,
      },
    });

    await prisma.estoqueUnidade.create({
      data: {
        unidadeId: fortaleza.id,
        produtoId: produto.id,
        quantidade: p.quantidadeEstoque,
      },
    });
  }
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

  for (const p of produtosNatal) {
    const produto = await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        categoria: p.categoria,
        precoBase: p.precoBase,
        unidadeId: natal.id,
      },
    });

    await prisma.estoqueUnidade.create({
      data: {
        unidadeId: natal.id,
        produtoId: produto.id,
        quantidade: p.quantidadeEstoque,
      },
    });
  }

  console.log('Preenchendo com usuarios de teste');
  const adminUser = await prisma.usuario.create({
    data: {
      nome: 'Administrador do Sistema',
      email: 'admin@raizesnordeste.com',
      senha: 'adminsecret123',
      perfil: 'ADMIN',
      ativo: true,
    },
  });

  const clienteUser = await prisma.usuario.create({
    data: {
      nome: 'Maria Silva',
      email: 'maria@email.com',
      senha: 'mariasecret123',
      perfil: 'CLIENTE',
      ativo: true,
    },
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
