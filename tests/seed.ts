import { prisma } from '../src/database/prismaClient';

export async function seedTestData() {
  console.log('🌱 Starting test database seeding...');

  // 1. Limpar logs e pagamentos e itens_pedido e pedidos de teste antigos para evitar conflitos de FK
  await prisma.logAuditoria.deleteMany({ where: { acao: 'CRIAR_PEDIDO' } });
  await prisma.itemPedido.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.estoqueUnidade.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.usuario.deleteMany({ where: { email: 'test@example.com' } });
  await prisma.unidade.deleteMany({ where: { nome: 'Unidade de Teste 1' } });

  // 2. Criar Unidade
  const unidade = await prisma.unidade.create({
    data: {
      nome: 'Unidade de Teste 1',
      endereco: 'Rua de Teste, 123',
      ativa: true,
    }
  });
  console.log(`Created Unidade ID: ${unidade.id}`);

  // 3. Criar Produto
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

  // 4. Criar Estoque
  const estoque = await prisma.estoqueUnidade.create({
    data: {
      unidadeId: unidade.id,
      produtoId: produto.id,
      quantidade: 100 // estoque abundante para o teste
    }
  });
  console.log(`Created Estoque ID: ${estoque.id} with quantity: ${estoque.quantidade}`);

  // 5. Criar Usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'testpassword123', // em produção seria hashed
      perfil: 'CLIENTE',
      ativo: true
    }
  });
  console.log(`Created Usuario ID: ${usuario.id}`);

  console.log('✅ Test database seeded successfully!');
  return {
    unidadeId: Number(unidade.id),
    produtoId: Number(produto.id),
    usuarioId: Number(usuario.id)
  };
}

if (require.main === module) {
  seedTestData().finally(() => prisma.$disconnect());
}
