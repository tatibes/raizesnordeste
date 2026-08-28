import { Request, Response, NextFunction } from 'express';
import { PedidoService } from '../services/PedidoService';
import { prisma } from '../database/prismaClient';
import { CanalPedido, Prisma, StatusPedido } from '@prisma/client';

function isCanalPedido(value: string): value is CanalPedido {
  return Object.values(CanalPedido).includes(value as CanalPedido);
}

function isStatusPedido(value: string): value is StatusPedido {
  return Object.values(StatusPedido).includes(value as StatusPedido);
}

export class PedidoController {
  private async buscarPedidos(where: Prisma.PedidoWhereInput) {
    return prisma.pedido.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: { select: { nome: true, email: true } },
        unidade: { select: { nome: true } },
        itens: { include: { produto: true } }
      }
    });
  }

  async listarPedidosPorUnidade(req: Request, res: Response, next: NextFunction) {
    try {
      const { unidadeId } = req.params;
      const { canalPedido, status } = req.query;

      const whereClause: Prisma.PedidoWhereInput = {
        unidadeId: BigInt(String(unidadeId))
      };

      if (canalPedido) {
        const canalStr = String(canalPedido).toUpperCase();
        if (!isCanalPedido(canalStr)) {
          return res.status(400).json({
            error: 'CANAL_INVALIDO',
            message: 'O campo canalPedido fornecido é inválido. Valores aceitos: APP, TOTEM, BALCAO, WEB ou PICKUP.',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
          });
        }
        whereClause.canalPedido = canalStr;
      }
      if (status) {
        const statusStr = String(status).toUpperCase();
        if (!isStatusPedido(statusStr)) {
          return res.status(400).json({
            error: 'STATUS_INVALIDO',
            message: 'O campo status fornecido é inválido.',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
          });
        }
        whereClause.status = statusStr;
      }

      const pedidos = await this.buscarPedidos(whereClause);

      return res.status(200).json(pedidos);
    } catch (error) {
      next(error);
    }
  }

  async listarTodosPedidos(req: Request, res: Response, next: NextFunction) {
      try {
        const whereClause: Prisma.PedidoWhereInput = {};
        const { canalPedido, status } = req.query;

        if (canalPedido) {
          const canalStr = String(canalPedido).toUpperCase();
          if (!isCanalPedido(canalStr)) {
            return res.status(400).json({
              error: 'CANAL_INVALIDO',
              message: 'O campo canalPedido fornecido é inválido.',
              timestamp: new Date().toISOString(),
              path: req.originalUrl
            });
          }
          whereClause.canalPedido = canalStr;
        }
        if (status) {
          const statusStr = String(status).toUpperCase();
          if (!isStatusPedido(statusStr)) {
            return res.status(400).json({
              error: 'STATUS_INVALIDO',
              message: 'O campo status fornecido é inválido.',
              timestamp: new Date().toISOString(),
              path: req.originalUrl
            });
          }
          whereClause.status = statusStr;
        }

        return res.status(200).json(await this.buscarPedidos(whereClause));
      } catch (error) {
        next(error);
      }
  }

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
      if (!['APP', 'TOTEM', 'BALCAO', 'WEB', 'PICKUP'].includes(canalPedido)) {
        return res.status(400).json({
          error: 'CANAL_INVALIDO',
          message: 'O campo canalPedido é obrigatório e deve ser APP, TOTEM, BALCAO, WEB ou PICKUP.',
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