-- DropForeignKey
ALTER TABLE "public"."CustomOrderRequest" DROP CONSTRAINT "CustomOrderRequest_baseProductId_fkey";

-- AlterTable
ALTER TABLE "CustomOrderRequest" ALTER COLUMN "baseProductId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomOrderRequest" ADD CONSTRAINT "CustomOrderRequest_baseProductId_fkey" FOREIGN KEY ("baseProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
