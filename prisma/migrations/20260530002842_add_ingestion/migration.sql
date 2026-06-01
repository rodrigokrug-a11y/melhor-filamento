-- CreateEnum
CREATE TYPE "IngestKind" AS ENUM ('PAGE', 'FEED');

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "sourceId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gtin" TEXT;

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "kind" "IngestKind" NOT NULL DEFAULT 'PAGE',
    "url" TEXT NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Source_sellerId_idx" ON "Source"("sellerId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_offerId_createdAt_idx" ON "PriceSnapshot"("offerId", "createdAt");

-- CreateIndex
CREATE INDEX "Offer_sourceId_idx" ON "Offer"("sourceId");

-- CreateIndex
CREATE INDEX "Product_gtin_idx" ON "Product"("gtin");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
