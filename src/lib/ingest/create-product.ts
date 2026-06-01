import { type Material, type ProductKind } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { ExtractedOffer } from "@/lib/scrape/types";
import { uniqueBrandSlug, uniqueProductSlug } from "@/lib/slug";

const FILAMENT_PATTERNS: [RegExp, Material][] = [
  [/\bpctg\b/i, "PCTG"],
  [/\bpetg\b/i, "PETG"],
  [/\bpla\b/i, "PLA"],
  [/\babs\b/i, "ABS"],
  [/\basa\b/i, "ASA"],
  [/\b(tpu|flex[ií]vel)\b/i, "TPU"],
  [/\bnylon\b/i, "NYLON"],
];

const RESIN_PATTERNS: [RegExp, Material][] = [
  [/lav[áa]vel|washable|water/i, "RESIN_WATER_WASHABLE"],
  [/tough|resistente|r[íi]gida/i, "RESIN_TOUGH"],
  [/resina/i, "RESIN_STANDARD"],
];

const COLORS = [
  "amarelo", "preto", "branco", "vermelho", "azul", "verde", "cinza",
  "laranja", "roxo", "rosa", "marrom", "dourado", "prata", "transparente",
  "natural", "bege", "ciano", "magenta", "violeta", "turquesa",
];

type Inferred = {
  kind: ProductKind;
  material: Material;
  color: string;
  netWeightG: number;
  diameterMm: number | null;
};

/** Infere material, cor, peso e diâmetro a partir do nome do produto. */
export function inferProductFields(name: string): Inferred {
  const isResin = /resina/i.test(name);
  let material: Material = "OUTRO";
  for (const [re, m] of isResin ? RESIN_PATTERNS : FILAMENT_PATTERNS) {
    if (re.test(name)) {
      material = m;
      break;
    }
  }

  const lower = name.toLowerCase();
  const color = COLORS.find((c) => lower.includes(c));
  const colorCap = color ? color[0].toUpperCase() + color.slice(1) : "Variado";

  let netWeightG = isResin ? 1000 : 1000;
  const kg = name.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  const g = name.match(/(\d+)\s*g\b/i);
  const ml = name.match(/(\d+)\s*ml\b/i);
  if (kg) netWeightG = Math.round(Number(kg[1].replace(",", ".")) * 1000);
  else if (g) netWeightG = Number(g[1]);
  else if (ml) netWeightG = Number(ml[1]);

  const d = name.match(/(1[.,]75|2[.,]85|3[.,]0{1,2})\s*mm/i);
  const diameterMm = isResin ? null : d ? Number(d[1].replace(",", ".")) : 1.75;

  return {
    kind: isResin ? "RESIN" : "FILAMENT",
    material,
    color: colorCap,
    netWeightG,
    diameterMm,
  };
}

const SPEC_RE = /\d+\s*(mm|kg|g|ml|cm|l)\b/i;

/** Tenta extrair a marca do sufixo do nome ("… - 3D Fila"). */
function brandFromName(raw: string): string | null {
  const m = raw.match(/[-–|]\s*([^-–|]+?)\s*$/);
  const cand = m?.[1]?.trim();
  if (!cand || SPEC_RE.test(cand) || cand.length > 30) return null;
  return cand;
}

function stripSuffix(name: string, suffix: string | null): string {
  if (!suffix) return name;
  const esc = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return name.replace(new RegExp(`\\s*[-–|]\\s*${esc}\\s*$`, "i"), "");
}

/** Remove sufixos de marketing/marca/loja do nome. */
function cleanName(
  raw: string,
  sellerName: string | null,
  brand: string | null,
): string {
  let n = raw.replace(/\s*para impressora 3d\s*/i, " ");
  n = stripSuffix(n, brand);
  n = stripSuffix(n, sellerName);
  return n.replace(/\s{2,}/g, " ").trim();
}

async function resolveBrandId(name: string): Promise<string> {
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.brand.create({
    data: { name, slug: await uniqueBrandSlug(name) },
    select: { id: true },
  });
  return created.id;
}

/**
 * Cria um produto no catálogo a partir de uma oferta extraída (link),
 * inferindo os campos do nome e usando a imagem do scrape.
 */
export async function createProductFromExtracted(
  extracted: ExtractedOffer,
  sellerName: string | null,
): Promise<{ id: string; name: string }> {
  const rawName = extracted.name ?? "Produto importado";
  const brandName =
    extracted.brand ?? brandFromName(rawName) ?? sellerName ?? "Sem marca";
  const name = cleanName(rawName, sellerName, brandName) || rawName;
  const fields = inferProductFields(rawName);
  const brandId = await resolveBrandId(brandName);

  const product = await prisma.product.create({
    data: {
      name,
      slug: await uniqueProductSlug(name),
      kind: fields.kind,
      material: fields.material,
      color: fields.color,
      netWeightG: fields.netWeightG,
      diameterMm: fields.diameterMm,
      brandId,
      gtin: extracted.gtin,
      imageUrl: extracted.image, // puxa a foto do produto
    },
    select: { id: true, name: true },
  });
  return product;
}
