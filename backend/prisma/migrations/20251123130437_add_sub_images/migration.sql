-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "subImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
