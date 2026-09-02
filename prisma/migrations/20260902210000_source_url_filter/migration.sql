-- Filtro de URL de produto por fonte. Null mantém o comportamento atual
-- (trechos padrão no código), então nenhuma fonte existente muda.
ALTER TABLE "Source" ADD COLUMN "urlFilter" TEXT;
