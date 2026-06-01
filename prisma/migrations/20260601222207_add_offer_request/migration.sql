-- CreateTable
CREATE TABLE "OfferRequest" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "email" TEXT,
    "sessionId" TEXT,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferRequest_brandId_idx" ON "OfferRequest"("brandId");

-- CreateIndex
CREATE INDEX "OfferRequest_handled_createdAt_idx" ON "OfferRequest"("handled", "createdAt");

-- AddForeignKey
ALTER TABLE "OfferRequest" ADD CONSTRAINT "OfferRequest_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
