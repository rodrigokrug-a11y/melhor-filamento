-- AlterTable: marca quando a ingestão viu a oferta na loja pela última vez
ALTER TABLE "Offer" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- Backfill das ofertas vindas de ingestão: sem isto todas ficariam com
-- lastSeenAt nulo e seriam tratadas como não verificadas até a próxima
-- execução do cron. `updatedAt` é a melhor aproximação disponível, já que a
-- ingestão grava a oferta a cada passagem.
-- Oferta cadastrada à mão (sourceId nulo) segue nula de propósito: ninguém a
-- revisita, então ela não deve expirar nem exibir data de verificação.
UPDATE "Offer" SET "lastSeenAt" = "updatedAt" WHERE "sourceId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Offer_lastSeenAt_idx" ON "Offer"("lastSeenAt");
