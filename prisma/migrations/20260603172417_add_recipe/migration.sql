-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "material" "Material" NOT NULL,
    "printer" TEXT NOT NULL,
    "nozzleTempC" INTEGER NOT NULL,
    "bedTempC" INTEGER NOT NULL,
    "speedMms" INTEGER,
    "retractionMm" DOUBLE PRECISION,
    "flowPct" INTEGER,
    "fanPct" INTEGER,
    "notes" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_material_status_idx" ON "Recipe"("material", "status");

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "Recipe"("status");
