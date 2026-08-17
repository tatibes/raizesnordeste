import { prisma } from '../database/prismaClient';

interface ItemRequest {
  produtoId: number;
  quantidade: number;
}

interface CriarPedidoDTO {
  usuarioId: number;
  unidadeId: number;
  canalPedido: 'APP' | 'TOTEM' | 'BALCAO' | 'WEB';
  formaPagamento: string;
  itens: ItemRequest[];
}

export class PedidoService {
  async processarPedido(data: CriarPedidoDTO) {
    // 1. Executa em transação para garantir consistência
    return await prisma.$transaction(async (tx) => {
      let valorTotal = 0;
      const itensFormatados = [];

      for (const item of data.itens) {
        // Valida Estoque na Unidade Específica
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
          const err: any = new Error(`Estoque insuficiente para o produto ID ${item.produtoId} na unidade.`);
          err.status = 422;
          err.code = 'ESTOQUE_INSUFICIENTE';
          throw err;
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

      // 2. Cria o Pedido com o Canal Obrigatório
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

      // 3. Regista Log de Auditoria (Requisito RNF)
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