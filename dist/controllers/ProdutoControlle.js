"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../database/prismaClient");
const router = (0, express_1.Router)();
// Exemplo de dados mockados para testes locais
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
router.get('/unidades/:unidadeId/produtos', async (req, res) => {
    try {
        const { unidadeId } = req.params;
        // Busca os produtos do banco de dados
        const produtos = await prismaClient_1.prisma.produto.findMany({
            where: { unidadeId: Number(unidadeId) }
        });
        if (produtos.length > 0) {
            return res.status(200).json(produtos);
        }
        // Exemplo estático/mock para testes como fallback:
        const produtosFiltrados = produtosMock.filter((p) => p.unidadeId === Number(unidadeId));
        return res.status(200).json(produtosFiltrados);
    }
    catch (error) {
        console.error('Erro ao buscar produtos do cardápio:', error);
        return res.status(500).json({ error: 'Erro interno ao carregar o cardápio.' });
    }
});
/**
 * GET /unidades
 * Retorna todas as unidades cadastradas no sistema
 */
router.get('/unidades', async (req, res) => {
    try {
        const unidades = await prismaClient_1.prisma.unidade.findMany({
            orderBy: { nome: 'asc' }
        });
        return res.status(200).json(unidades);
    }
    catch (error) {
        console.error('Erro ao buscar unidades:', error);
        return res.status(500).json({ error: 'Erro interno ao carregar as unidades.' });
    }
});
/**
 * POST /produtos
 * Cria um novo produto e inicializa o estoque dele para a respectiva unidade
 */
router.post('/produtos', async (req, res) => {
    try {
        const { nome, descricao, categoria, precoBase, unidadeId, quantidadeEstoque } = req.body;
        if (!nome || !precoBase || !unidadeId) {
            return res.status(400).json({ error: 'Campos nome, precoBase e unidadeId são obrigatórios.' });
        }
        const produto = await prismaClient_1.prisma.$transaction(async (tx) => {
            // 1. Criar o produto
            const novoProduto = await tx.produto.create({
                data: {
                    nome,
                    descricao,
                    categoria,
                    precoBase: Number(precoBase),
                    unidadeId: BigInt(unidadeId)
                }
            });
            // 2. Criar ou inicializar o estoque na unidade
            await tx.estoqueUnidade.create({
                data: {
                    unidadeId: BigInt(unidadeId),
                    produtoId: novoProduto.id,
                    quantidade: quantidadeEstoque ? Number(quantidadeEstoque) : 0
                }
            });
            return novoProduto;
        });
        return res.status(201).json(produto);
    }
    catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        return res.status(500).json({ error: 'Erro interno ao cadastrar produto.' });
    }
});
exports.default = router;
