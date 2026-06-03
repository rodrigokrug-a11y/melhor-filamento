-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BannerPlacement" ADD VALUE 'FILAMENTOS';
ALTER TYPE "BannerPlacement" ADD VALUE 'RESINAS';
ALTER TYPE "BannerPlacement" ADD VALUE 'IMPRESSORAS';
ALTER TYPE "BannerPlacement" ADD VALUE 'MARCAS';
ALTER TYPE "BannerPlacement" ADD VALUE 'COMPARAR';
ALTER TYPE "BannerPlacement" ADD VALUE 'RANKING';
ALTER TYPE "BannerPlacement" ADD VALUE 'DICAS';
ALTER TYPE "BannerPlacement" ADD VALUE 'PRODUTO';

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
