-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "city" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "offersPickup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uf" TEXT;
