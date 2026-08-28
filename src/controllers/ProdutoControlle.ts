import { Router, Request, Response } from 'express';
import { prisma } from '../database/prismaClient';

const router = Router();

/**
 * GET /unidades/:unidadeId/produtos
 * Lista os produtos do cardápio pertencentes a uma unidade específica
 */
router.get('/unidades/:unidadeId/produtos', async (req: Request, res: Response) => {
  try {
    const { unidadeId } = req.params;

    // Busca os produtos do banco de dados
    const produtos = await prisma.produto.findMany({
      where: { unidadeId: Number(unidadeId) }
    });

    return res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos do cardápio:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar o cardápio.' });
  }
});

router.get('/unidades/:unidadeId/estoque', async (req: Request, res: Response) => {
  try {
    const unidadeId = Number(req.params.unidadeId);
    if (!Number.isInteger(unidadeId) || unidadeId <= 0) {
      return res.status(400).json({ error: 'UNIDADE_INVALIDA', message: 'Unidade inválida.' });
    }

    const estoque = await prisma.estoqueUnidade.findMany({
      where: { unidadeId },
      include: { produto: true },
      orderBy: { produto: { nome: 'asc' } }
    });

    return res.status(200).json(estoque);
  } catch (error) {
    console.error('Erro ao consultar estoque:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar o estoque.' });
  }
});

/**
 * GET /unidades
 * Retorna todas as unidades cadastradas no sistema
 */
router.get('/unidades', async (req: Request, res: Response) => {
  try {
    const unidades = await prisma.unidade.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.status(200).json(unidades);
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar as unidades.' });
  }
});

/**
 * POST /produtos
 * Cria um novo produto e inicializa o estoque dele para a respectiva unidade
 */
router.post('/produtos', async (req: Request, res: Response) => {
  try {
    const { nome, descricao, categoria, precoBase, unidadeId, quantidadeEstoque } = req.body;

    const preco = Number(precoBase);
    const unidade = Number(unidadeId);
    const quantidade = quantidadeEstoque === undefined ? 0 : Number(quantidadeEstoque);

    if (
      typeof nome !== 'string' ||
      nome.trim().length === 0 ||
      !Number.isFinite(preco) ||
      preco <= 0 ||
      !Number.isInteger(unidade) ||
      unidade <= 0 ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      return res.status(400).json({ error: 'Campos nome, precoBase e unidadeId são obrigatórios.' });
    }

    const produto = await prisma.$transaction(async (tx) => {
      //Criar o produto
      const novoProduto = await tx.produto.create({
        data: {
          nome,
          descricao,
          categoria,
          precoBase: preco,
          unidadeId: BigInt(unidade)
        }
      });

      //Criar ou inicializar o estoque na unidade
      await tx.estoqueUnidade.create({
        data: {
          unidadeId: BigInt(unidade),
          produtoId: novoProduto.id,
          quantidade
        }
      });

      return novoProduto;
    });

    return res.status(201).json(produto);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar produto.' });
  }
});

export default router;
