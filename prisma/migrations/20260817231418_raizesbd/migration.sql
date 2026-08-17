/*
  Warnings:

  - You are about to alter the column `valor_total` on the `pedidos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "pedidos" ALTER COLUMN "valor_total" SET DATA TYPE DOUBLE PRECISION;
