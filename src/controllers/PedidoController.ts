import { Request, Response, NextFunction } from 'express';
import { PedidoService } from '../services/PedidoService';
import { prisma } from '../database/prismaClient';
import { CanalPedido, Prisma } from '@prisma/client';

function isCanalPedido(value: string): value is CanalPedido {
  return Object.values(CanalPedido).includes(value as CanalPedido);
}

export class PedidoController {

  async listarPedidosPorUnidade(req: Request, res: Response, next: NextFunction) {
    try {
      const { unidadeId } = req.params;
      const { canalPedido } = req.query;

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

      const pedidos = await prisma.pedido.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          usuario: {
            select: {
              nome: true,
              email: true
            }
          },
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      return res.status(200).json(pedidos);
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