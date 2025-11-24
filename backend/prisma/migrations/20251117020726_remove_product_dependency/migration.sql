/*
  Warnings:

  - You are about to drop the column `baseProductId` on the `CustomOrderRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CustomOrderRequest" DROP CONSTRAINT "CustomOrderRequest_baseProductId_fkey";

-- AlterTable
ALTER TABLE "CustomOrderRequest" DROP COLUMN "baseProductId";
