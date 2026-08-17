"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoRoutes = void 0;
const express_1 = require("express");
const PedidoController_1 = require("../controllers/PedidoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prismaClient_1 = require("../database/prismaClient");
const crypto_1 = __importDefault(require("crypto"));
const pedidoRoutes = (0, express_1.Router)();
exports.pedidoRoutes = pedidoRoutes;
const controller = new PedidoController_1.PedidoController();
// Exige autenticação JWT
pedidoRoutes.post('/pedidos', authMiddleware_1.authMiddleware, controller.criarPedido);
// Listagem de pedidos de uma unidade específica (para painel)
pedidoRoutes.get('/unidades/:unidadeId/pedidos', controller.listarPedidosPorUnidade);
// ROTA DE LOGIN DO USUÁRIO
pedidoRoutes.post('/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }
        const usuario = await prismaClient_1.prisma.usuario.findUnique({
            where: { email }
        });
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        // Sign JWT natively
        const payload = {
            id: Number(usuario.id),
            perfil: usuario.perfil,
            nome: usuario.nome,
            email: usuario.email
        };
        const secret = process.env.JWT_SECRET || '77256de1-6faa-4dc0-a481-eb93fac29c39';
        const header = { alg: 'HS256', typ: 'JWT' };
        const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
        const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const hmac = crypto_1.default.createHmac('sha256', secret);
        hmac.update(`${headerB64}.${payloadB64}`);
        const signature = hmac.digest('base64url');
        const token = `${headerB64}.${payloadB64}.${signature}`;
        return res.status(200).json({
            token,
            usuario: {
                id: Number(usuario.id),
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
    }
    catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
});
