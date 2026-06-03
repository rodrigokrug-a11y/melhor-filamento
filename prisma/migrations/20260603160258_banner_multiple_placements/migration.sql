-- DropIndex
DROP INDEX "Banner_placement_status_idx";

-- AlterTable: adiciona o array novo, migra os dados e só então remove a coluna antiga
ALTER TABLE "Banner" ADD COLUMN "placements" "BannerPlacement"[];

-- Preserva os banners existentes: placement único -> array de um elemento
UPDATE "Banner" SET "placements" = ARRAY["placement"]::"BannerPlacement"[];

-- Remove a coluna antiga
ALTER TABLE "Banner" DROP COLUMN "placement";
