-- CreateEnum
CREATE TYPE "BoostPlacement" AS ENUM ('TOP_FILAMENT', 'TOP_RESIN', 'TOP_PRINTER');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'REJECTED', 'ENDED');

-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HOME', 'GLOBAL');

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "Boost" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "placement" "BoostPlacement" NOT NULL,
    "bidAmount" DECIMAL(10,2) NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT,
    "placement" "BannerPlacement" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "bidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "AdStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Boost_placement_status_idx" ON "Boost"("placement", "status");

-- CreateIndex
CREATE INDEX "Boost_sellerId_idx" ON "Boost"("sellerId");

-- CreateIndex
CREATE INDEX "Banner_placement_status_idx" ON "Banner"("placement", "status");

-- CreateIndex
CREATE INDEX "Banner_sellerId_idx" ON "Banner"("sellerId");

-- AddForeignKey
ALTER TABLE "Boost" ADD CONSTRAINT "Boost_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
