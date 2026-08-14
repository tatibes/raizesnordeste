import { Request, Response, NextFunction } from 'express';
import { PedidoService } from '../services/PedidoService';

export class PedidoController {

  async criarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      // Verifica se o usuário está autenticado antes de acessar propriedades
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado.'
        });
      }
      const usuarioId = req.user.id; // Extraído do Token JWT no authMiddleware
      const { unidadeId, canalPedido, formaPagamento, itens } = req.body;
      // Validação básica do canal obrigatório
      if (!['APP', 'TOTEM', 'BALCAO', 'WEB'].includes(canalPedido)) {
        return res.status(400).json({
          error: 'CANAL_INVALIDO',
          message: 'O campo canalPedido é obrigatório e deve ser APP, TOTEM, BALCAO ou WEB.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      }

      const service = new PedidoService();
      const pedidoCriado = await service.processarPedido({
        usuarioId: Number(usuarioId),
        unidadeId,
        canalPedido,
        formaPagamento,
        itens
      });

      return res.status(201).json(pedidoCriado);
    } catch (error) {
      next(error); // Encaminha para o errorHandler
    }
  }
}