import { prisma } from "@/lib/db";
import { inferProductFields } from "@/lib/ingest/create-product";

export type ProductRef = {
  id: string;
  name: string;
  gtin: string | null;
  brandName: string;
  signature: string | null;
};

export type MatchCandidate = {
  name: string | null;
  gtin: string | null;
  brand: string | null;
};

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Palavras que NÃO identificam o produto (ruído de nome/embalagem/spec).
const NOISE = new Set([
  "filamento", "filament", "para", "impressora", "impressoras", "impressao",
  "3d", "de", "da", "do", "dos", "das", "com", "e", "o", "a", "kg", "g", "ml",
  "l", "cm", "mm", "premium", "rolo", "bobina", "carretel", "cor", "material",
  "novo", "nova", "un", "und", "pct", "kit",
]);
// Material-base (entra na assinatura como campo próprio, então sai dos tokens).
const BASE_MATERIAL = new Set([
  "pla", "abs", "petg", "pctg", "tpu", "asa", "nylon", "pc", "hips", "resina",
  "resin",
]);

function tokens(s: string): string[] {
  return normalizeText(s).split(" ").filter(Boolean);
}

/** Tokens da cor/variação — o que diferencia produtos da mesma marca/material. */
function colorTokens(name: string, brand: string | null): string {
  const brandToks = new Set(brand ? tokens(brand) : []);
  const toks = tokens(name).filter(
    (t) =>
      !NOISE.has(t) &&
      !BASE_MATERIAL.has(t) &&
      !brandToks.has(t) &&
      !/^\d+([.,]\d+)?$/.test(t) && // números puros (1, 75, 175)
      !/^\d+([.,]\d+)?(kg|g|mm|ml|l|cm)$/.test(t), // specs c/ unidade (1kg, 75mm, 500g)
  );
  return [...new Set(toks)].sort().join(" ");
}

/**
 * Assinatura canônica: marca + material + peso + diâmetro + cor/variação.
 * Mesma assinatura = mesmo produto, independente de como cada loja escreve o
 * nome. Retorna null quando não dá pra identificar com segurança (material
 * desconhecido ou sem cor/variação) — aí preferimos NÃO casar a casar errado.
 */
export function productSignature(input: {
  name: string;
  brand: string | null;
  material: string;
  netWeightG: number;
  diameterMm: number | null;
}): string | null {
  if (input.material === "OUTRO") return null;
  const color = colorTokens(input.name, input.brand);
  if (!color) return null;
  return [
    normalizeText(input.brand ?? ""),
    input.material,
    input.netWeightG,
    input.diameterMm ?? "",
    color,
  ].join("|");
}

function candidateSignature(c: MatchCandidate): string | null {
  if (!c.name) return null;
  const f = inferProductFields(c.name);
  return productSignature({
    name: c.name,
    brand: c.brand,
    material: f.material,
    netWeightG: f.netWeightG,
    diameterMm: f.diameterMm,
  });
}

/** Casa um candidato com um produto: GTIN → assinatura canônica → nome idêntico. */
export function matchProduct(
  candidate: MatchCandidate,
  index: ProductRef[],
): string | null {
  if (candidate.gtin) {
    const byGtin = index.find((p) => p.gtin && p.gtin === candidate.gtin);
    if (byGtin) return byGtin.id;
  }
  const sig = candidateSignature(candidate);
  if (sig) {
    const bySig = index.find((p) => p.signature === sig);
    if (bySig) return bySig.id;
  }
  if (candidate.name) {
    const target = normalizeText(candidate.name);
    const byName = index.find((p) => normalizeText(p.name) === target);
    if (byName) return byName.id;
  }
  return null;
}

export async function loadProductIndex(): Promise<ProductRef[]> {
  const rows = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      gtin: true,
      brand: { select: { name: true } },
      material: true,
      netWeightG: true,
      diameterMm: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    gtin: r.gtin,
    brandName: r.brand.name,
    signature: productSignature({
      name: r.name,
      brand: r.brand.name,
      material: r.material,
      netWeightG: r.netWeightG,
      diameterMm: r.diameterMm,
    }),
  }));
}
