import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const pedidoRoutes = Router();
const controller = new PedidoController();

// Exige autenticação JWT
pedidoRoutes.post('/pedidos', authMiddleware, controller.criarPedido);

export { pedidoRoutes };