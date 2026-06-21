-- AlterTable: campos de afiliado por loja (monetização aplicada no /go)
ALTER TABLE "Seller" ADD COLUMN     "affiliateParams" TEXT,
ADD COLUMN     "affiliateTemplate" TEXT;
