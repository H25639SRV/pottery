/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "weight" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
