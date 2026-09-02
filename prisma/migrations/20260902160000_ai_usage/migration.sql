-- CreateEnum
CREATE TYPE "AiTool" AS ENUM ('ASSISTENTE', 'DIAGNOSTICO');

-- CreateTable: uma linha por chamada às ferramentas de IA.
-- Só metadados: nunca a pergunta nem a resposta.
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "tool" "AiTool" NOT NULL,
    "userId" TEXT,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsage_createdAt_idx" ON "AiUsage"("createdAt");

-- CreateIndex
CREATE INDEX "AiUsage_tool_createdAt_idx" ON "AiUsage"("tool", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsage_userId_idx" ON "AiUsage"("userId");

-- AddForeignKey: o histórico sobrevive à exclusão da conta, com autoria anulada.
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
