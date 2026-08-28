import { prisma } from '../database/prismaClient';
import { AppError } from '../errors/AppError';

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
    if (!Number.isInteger(data.unidadeId) || data.unidadeId <= 0) {
      throw new AppError('Unidade inválida.', 400, 'UNIDADE_INVALIDA');
    }

    if (!Array.isArray(data.itens) || data.itens.length === 0) {
      throw new AppError('O pedido deve conter pelo menos um item.', 400, 'ITENS_INVALIDOS');
    }

    //Executa em transação para garantir consistência
    return await prisma.$transaction(async (tx) => {
      let valorTotal = 0;
      const itensFormatados = [];

      for (const item of data.itens) {
        if (!Number.isInteger(item.produtoId) || item.produtoId <= 0 ||
            !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
          throw new AppError(
            'Cada item deve ter produtoId e quantidade inteira positiva.',
            400,
            'ITEM_INVALIDO'
          );
        }

        //Valida Estoque na Unidade Específica
        const estoque = await tx.estoqueUnidade.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId: data.unidadeId,
              produtoId: item.produtoId
            }
          },
          include: { produto: true }
        });

        if (!estoque || estoque.quantidade < item.quantidade) {
          throw new AppError(
            `Estoque insuficiente para o produto ID ${item.produtoId} na unidade.`,
            422,
            'ESTOQUE_INSUFICIENTE'
          );
        }

        // Abate o estoque local
        await tx.estoqueUnidade.update({
          where: { id: estoque.id },
          data: { quantidade: estoque.quantidade - item.quantidade }
        });

        const subtotal = Number(estoque.produto.precoBase) * item.quantidade;
        valorTotal += subtotal;

        itensFormatados.push({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: estoque.produto.precoBase,
          subtotal
        });
      }

      //Cria o Pedido com o Canal Obrigatório
      const pedido = await tx.pedido.create({
        data: {
          usuarioId: data.usuarioId,
          unidadeId: data.unidadeId,
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

      //Regista Log de Auditoria (Requisito RNF)
      await tx.logAuditoria.create({
        data: {
          usuarioId: data.usuarioId,
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