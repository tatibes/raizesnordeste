import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../errors/AppError';

const metodosPagamento = ['PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'DINHEIRO'];

export class PagamentoController {
  async processarMock(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED');
      }

      const pedidoId = Number(req.body.pedidoId);
      const metodoPagamento = String(req.body.metodoPagamento || '').toUpperCase();
      const simularAprovacao = req.body.simularAprovacao;

      if (
        !Number.isInteger(pedidoId) ||
        pedidoId <= 0 ||
        !metodosPagamento.includes(metodoPagamento) ||
        typeof simularAprovacao !== 'boolean'
      ) {
        throw new AppError(
          'pedidoId, metodoPagamento e simularAprovacao são obrigatórios e válidos.',
          400,
          'PAGAMENTO_INVALIDO'
        );
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const pedido = await tx.pedido.findUnique({
          where: { id: BigInt(pedidoId) },
          include: { itens: true }
        });

        if (!pedido) {
          throw new AppError('Pedido não encontrado.', 404, 'PEDIDO_NAO_ENCONTRADO');
        }

        if (pedido.usuarioId !== BigInt(req.user!.id)) {
          throw new AppError('Você não pode pagar este pedido.', 403, 'FORBIDDEN');
        }

        if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
          throw new AppError('Este pedido não aguarda pagamento.', 400, 'PEDIDO_FORA_DO_FLUXO');
        }

        const pagamento = await tx.pagamento.create({
          data: {
            pedidoId: pedido.id,
            status: simularAprovacao ? 'APROVADO' : 'RECUSADO',
            valor: pedido.valorTotal
          }
        });

        if (!simularAprovacao) {
          for (const item of pedido.itens) {
            await tx.estoqueUnidade.update({
              where: {
                unidadeId_produtoId: {
                  unidadeId: pedido.unidadeId,
                  produtoId: item.produtoId
                }
              },
              data: { quantidade: { increment: item.quantidade } }
            });
          }
        }

        const pedidoAtualizado = await tx.pedido.update({
          where: { id: pedido.id },
          data: { status: simularAprovacao ? 'EM_PREPARACAO' : 'CANCELADO' },
          include: { itens: true }
        });

        return { pagamento, pedido: pedidoAtualizado };
      });

      return res.status(200).json({
        pagamentoId: resultado.pagamento.id,
        pedidoId: resultado.pedido.id,
        status: resultado.pagamento.status,
        pedidoStatus: resultado.pedido.status,
        valor: resultado.pagamento.valor,
        metodoPagamento
      });
    } catch (error) {
      next(error);
    }
  }
}
