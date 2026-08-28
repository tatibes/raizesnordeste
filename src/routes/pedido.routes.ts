import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { prisma } from '../database/prismaClient';
import crypto from 'crypto';
import { verifyPassword } from '../utils/password';
import { PagamentoController } from '../controllers/PagamentoController';

const pedidoRoutes = Router();
const controller = new PedidoController();
const pagamentoController = new PagamentoController();

// Exige autenticação JWT
pedidoRoutes.post('/pedidos', authMiddleware, controller.criarPedido);

// Listagem de pedidos de uma unidade específica (para painel)
pedidoRoutes.get('/unidades/:unidadeId/pedidos', controller.listarPedidosPorUnidade.bind(controller));
pedidoRoutes.get('/pedidos', controller.listarTodosPedidos.bind(controller));
pedidoRoutes.post('/pagamentos/mock', authMiddleware, pagamentoController.processarMock);

// ROTA DE LOGIN DO USUÁRIO
pedidoRoutes.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario || !usuario.ativo || !(await verifyPassword(senha, usuario.senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Sign JWT natively
    const payload = {
      id: Number(usuario.id),
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email
    };
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET não configurado.' });
    }
    
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60
    })).toString('base64url');
    
    const hmac = crypto.createHmac('sha256', secret);
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
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

export { pedidoRoutes };