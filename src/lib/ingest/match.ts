import { prisma } from "@/lib/db";

export type ProductRef = {
  id: string;
  name: string;
  gtin: string | null;
  brandName: string;
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

/** Casa um candidato com um produto: primeiro por GTIN, depois por nome normalizado. */
export function matchProduct(
  candidate: MatchCandidate,
  index: ProductRef[],
): string | null {
  if (candidate.gtin) {
    const byGtin = index.find((p) => p.gtin && p.gtin === candidate.gtin);
    if (byGtin) return byGtin.id;
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
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    gtin: r.gtin,
    brandName: r.brand.name,
  }));
}
