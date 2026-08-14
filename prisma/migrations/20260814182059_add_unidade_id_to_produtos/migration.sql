-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'GERENTE', 'CLIENTE', 'COZINHA', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "CanalPedido" AS ENUM ('APP', 'WEB', 'BALCAO', 'TOTEM', 'PICKUP');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('AGUARDANDO_PAGAMENTO', 'EM_PREPARACAO', 'PRONTO', 'ENTREGUE', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "endereco" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(50),
    "preco_base" DECIMAL(10,2) NOT NULL,
    "unidade_id" BIGINT NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque_unidade" (
    "id" BIGSERIAL NOT NULL,
    "unidade_id" BIGINT NOT NULL,
    "produto_id" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estoque_unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "unidade_id" BIGINT NOT NULL,
    "canal_pedido" "CanalPedido" NOT NULL DEFAULT 'APP',
    "status" "StatusPedido" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "valor_total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" BIGSERIAL NOT NULL,
    "pedido_id" BIGINT NOT NULL,
    "produto_id" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" BIGSERIAL NOT NULL,
    "pedido_id" BIGINT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelidade" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "pontos_acumulados" INTEGER NOT NULL DEFAULT 0,
    "ultima_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fidelidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT,
    "acao" VARCHAR(100) NOT NULL,
    "detalhes" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "estoque_unidade_unidade_id_produto_id_key" ON "estoque_unidade"("unidade_id", "produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "fidelidade_usuario_id_key" ON "fidelidade"("usuario_id");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque_unidade" ADD CONSTRAINT "estoque_unidade_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque_unidade" ADD CONSTRAINT "estoque_unidade_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fidelidade" ADD CONSTRAINT "fidelidade_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
