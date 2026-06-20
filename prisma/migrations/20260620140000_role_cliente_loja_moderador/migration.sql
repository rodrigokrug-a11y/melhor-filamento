-- Troca o enum Role: (ADMIN, SELLER) -> (CLIENTE, LOJA, MODERADOR).
-- Mapeamento dos usuários existentes: quem é DONO de uma loja vira LOJA;
-- todos os demais (inclusive antigos ADMIN/SELLER avulsos) viram CLIENTE.
-- Admin continua sendo decidido por e-mail (ADMIN_EMAILS), fora do enum.
--
-- Obs.: o Postgres não permite subquery no USING do ALTER COLUMN TYPE, então
-- a conversão usa uma constante (todos -> CLIENTE) e os donos de loja são
-- ajustados depois com um UPDATE (que aceita subquery).

ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('CLIENTE', 'LOJA', 'MODERADOR');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role"
  USING ('CLIENTE'::"Role");

UPDATE "User"
  SET "role" = 'LOJA'
  WHERE "id" IN (
    SELECT "ownerUserId" FROM "Seller" WHERE "ownerUserId" IS NOT NULL
  );

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENTE';

DROP TYPE "Role_old";
