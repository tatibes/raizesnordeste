import { Router, Request, Response } from 'express';

const router = Router();

// Exemplo de dados mockados (caso ainda não esteja conectado a um banco de dados)
const produtosMock = [
  {
    id: 1,
    unidadeId: 1,
    nome: 'Baião de Dois',
    descricao: 'Arroz, feijão fradinho, queijo coalho e carne de sol.',
    preco_base: 35.90,
    categoria: 'Prato Principal'
  },
  {
    id: 2,
    unidadeId: 1,
    nome: 'Carne de Sol com Mandioca',
    descricao: 'Carne de sol acebolada servida com mandioca frita.',
    preco_base: 42.00,
    categoria: 'Prato Principal'
  },
  {
    id: 3,
    unidadeId: 2,
    nome: 'Moqueca Baiana',
    descricao: 'Peixe fresco com leite de coco, azeite de dendê e pimentões.',
    preco_base: 58.00,
    categoria: 'Peixes e Frutos do Mar'
  },
  {
    id: 4,
    unidadeId: 1,
    nome: 'Cartola',
    descricao: 'Banana frita com queijo coalho, açúcar e canela.',
    preco_base: 15.00,
    categoria: 'Sobremesa'
  }
];

/**
 * GET /unidades/:unidadeId/produtos
 * Lista os produtos do cardápio pertencentes a uma unidade específica
 */
router.get('/unidades/:unidadeId/produtos', async (req: Request, res: Response) => {
  try {
    const { unidadeId } = req.params;

    // Se estiver usando Banco de Dados (Prisma, TypeORM, Knex, etc.):
    // const produtos = await prisma.produto.findMany({
    //   where: { unidadeId: Number(unidadeId) }
    // });

    // Exemplo estático/mock para testes:
    const produtosFiltrados = produtosMock.filter(
      (p) => p.unidadeId === Number(unidadeId)
    );

    return res.status(200).json(produtosFiltrados);
  } catch (error) {
    console.error('Erro ao buscar produtos do cardápio:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar o cardápio.' });
  }
});

export default router;