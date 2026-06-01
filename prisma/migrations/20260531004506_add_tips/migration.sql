-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "material" "Material" NOT NULL,
    "productId" TEXT,
    "nozzleTempC" INTEGER,
    "bedTempC" INTEGER,
    "speedMms" INTEGER,
    "notes" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tip_material_status_idx" ON "Tip"("material", "status");

-- CreateIndex
CREATE INDEX "Tip_status_idx" ON "Tip"("status");

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
