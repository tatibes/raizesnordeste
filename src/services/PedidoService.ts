import { prisma } from '../database/prismaClient';
import { AppError } from '../errors/AppError';
import { parsePositiveInt, parsePositiveBigInt } from '../utils/parseId';

interface ItemRequest {
  produtoId: number;
  quantidade: number;
}

interface CriarPedidoDTO {
  usuarioId: number;
  unidadeId: number;
  canalPedido: 'APP' | 'TOTEM' | 'BALCAO' | 'WEB' | 'PICKUP';
  formaPagamento: string;
  itens: ItemRequest[];
}

export class PedidoService {
  async processarPedido(data: CriarPedidoDTO) {
    const unidadeId = parsePositiveInt(data.unidadeId, 'unidadeId');
    const usuarioId = parsePositiveInt(data.usuarioId, 'usuarioId');

    if (!Array.isArray(data.itens) || data.itens.length === 0) {
      throw new AppError('O pedido deve conter pelo menos um item.', 400, 'ITENS_INVALIDOS');
    }

    return await prisma.$transaction(async (tx) => {
      let valorTotal = 0;
      const itensFormatados = [];

      for (const item of data.itens) {
        const produtoId = parsePositiveInt(item.produtoId, 'produtoId');
        const quantidade = parsePositiveInt(item.quantidade, 'quantidade');

        const estoque = await tx.estoqueUnidade.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId: parsePositiveBigInt(unidadeId, 'unidadeId'),
              produtoId: parsePositiveBigInt(produtoId, 'produtoId')
            }
          },
          include: { produto: true }
        });

        if (!estoque || estoque.quantidade < quantidade) {
          throw new AppError(
            `Estoque insuficiente para o produto ID ${produtoId} na unidade.`,
            422,
            'ESTOQUE_INSUFICIENTE'
          );
        }

        await tx.estoqueUnidade.update({
          where: { id: estoque.id },
          data: { quantidade: estoque.quantidade - quantidade }
        });

        const subtotal = Number(estoque.produto.precoBase) * quantidade;
        valorTotal += subtotal;

        itensFormatados.push({
          produtoId,
          quantidade,
          precoUnitario: estoque.produto.precoBase,
          subtotal
        });
      }

      const pedido = await tx.pedido.create({
        data: {
          usuarioId: parsePositiveBigInt(usuarioId, 'usuarioId'),
          unidadeId: parsePositiveBigInt(unidadeId, 'unidadeId'),
          canalPedido: data.canalPedido,
          status: 'AGUARDANDO_PAGAMENTO',
          valorTotal,
          itens: {
            createMany: {
              data: itensFormatados
            }
          }
        },
        include: { itens: true }
      });

      await tx.logAuditoria.create({
        data: {
          usuarioId: parsePositiveBigInt(usuarioId, 'usuarioId'),
          acao: 'CRIAR_PEDIDO',
          detalhes: { valorTotal, canal: data.canalPedido, recurso: `/pedidos/${pedido.id}` }
        }
      });

      return {
        pedidoId: pedido.id,
        canalPedido: pedido.canalPedido,
        status: pedido.status,
        total: pedido.valorTotal,
        itens: pedido.itens
      };
    });
  }
}