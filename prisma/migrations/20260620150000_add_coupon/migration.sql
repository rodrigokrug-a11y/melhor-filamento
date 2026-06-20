-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sellerId" TEXT NOT NULL,
    "submittedById" TEXT,
    "submittedByName" TEXT,
    "discountType" "CouponType",
    "discountValue" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coupon_sellerId_status_idx" ON "Coupon"("sellerId", "status");

-- CreateIndex
CREATE INDEX "Coupon_status_idx" ON "Coupon"("status");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
