import {
  bodyOfName,
  brandFromKnown,
  loadKnownBrands,
} from "@/lib/ingest/create-product";
import { prisma } from "@/lib/db";

/**
 * Reclassifica a marca de produtos JÁ salvos.
 *
 * A correção na derivação só vale para o que a ingestão ler daqui em diante:
 * produto já cadastrado casa por nome no re-scrape e carrega a marca antiga
 * para sempre. Sem este passo, corrigir a regra não conserta o catálogo.
 *
 * É conservador de propósito — só troca quando encontra uma marca CONHECIDA
 * escrita no nome do produto. Nunca esvazia uma marca, nunca inventa nome novo,
 * nunca cria marca que não esteja cadastrada. Na dúvida, não mexe.
 */

export type BrandChange = {
  productId: string;
  productName: string;
  from: string;
  to: string;
};

export type RebrandPlan = {
  knownBrands: number;
  products: number;
  changes: BrandChange[];
};

export async function planRebrand(): Promise<RebrandPlan> {
  const known = await loadKnownBrands();

  const sellers = await prisma.seller.findMany({ select: { name: true } });
  const sellerNames = new Set(sellers.map((s) => s.name.trim().toLowerCase()));

  const products = await prisma.product.findMany({
    select: { id: true, name: true, brand: { select: { name: true } } },
  });

  const changes: BrandChange[] = [];
  for (const p of products) {
    const current = p.brand.name;

    // Só mexe em produto preso ao nome de uma LOJA — que é o defeito. Produto
    // já atribuído a um fabricante de verdade fica como está: numa passagem em
    // massa, "Creality" virar "Sermoon" (a linha dela) não é ganho nenhum e
    // "Creality" virar "3D Fila" (a loja, carimbada no fim do título) é perda.
    if (!sellerNames.has(current.trim().toLowerCase())) continue;

    // 1. Fabricante conhecido escrito no corpo do nome. É o caso do filamento
    //    Bambu Lab vendido pela 3D Prime, que ficou com a marca da loja porque
    //    a loja se anuncia como marca no JSON-LD. O sufixo do título fica de
    //    fora: lá mora o carimbo da loja, não o fabricante.
    let target = brandFromKnown(bodyOfName(p.name), known);

    // 2. A própria marca-loja contém uma marca conhecida ("eSUN Brasil" →
    //    "eSun"). Ela sai dos candidatos: estando cadastrada, casaria consigo
    //    mesma por ser o nome mais longo e esconderia a marca de dentro.
    if (!target) {
      const outros = known.filter(
        (b) => b.trim().toLowerCase() !== current.trim().toLowerCase(),
      );
      target = brandFromKnown(current, outros);
    }

    if (!target) continue;
    if (target.trim().toLowerCase() === current.trim().toLowerCase()) continue;

    changes.push({
      productId: p.id,
      productName: p.name,
      from: current,
      to: target,
    });
  }

  return { knownBrands: known.length, products: products.length, changes };
}

/** Agrupa as trocas por transição — é assim que dá para conferir antes de aplicar. */
export function groupChanges(
  changes: BrandChange[],
): { from: string; to: string; count: number; sample: string[] }[] {
  const byPair = new Map<
    string,
    { from: string; to: string; items: BrandChange[] }
  >();
  for (const c of changes) {
    // Nome de marca tem espaço ("Bambu Lab"), então a chave não serve para
    // reabrir o par: from/to ficam guardados junto com o grupo.
    const key = `${c.from.toLowerCase()}->${c.to.toLowerCase()}`;
    const g = byPair.get(key);
    if (g) g.items.push(c);
    else byPair.set(key, { from: c.from, to: c.to, items: [c] });
  }
  return [...byPair.values()]
    .map((g) => ({
      from: g.from,
      to: g.to,
      count: g.items.length,
      sample: g.items.slice(0, 3).map((c) => c.productName),
    }))
    .sort((a, b) => b.count - a.count);
}

export async function applyRebrand(
  changes: BrandChange[],
): Promise<{ applied: number; skipped: number }> {
  const brands = await prisma.brand.findMany({ select: { id: true, name: true } });
  const idByName = new Map(
    brands.map((b) => [b.name.trim().toLowerCase(), b.id] as const),
  );

  let applied = 0;
  let skipped = 0;
  for (const c of changes) {
    const toId = idByName.get(c.to.trim().toLowerCase());
    if (!toId) {
      // Não deveria acontecer: a lista sai da tabela Brand. Mas se o nome veio
      // da semente embutida e não está cadastrado, pular é melhor que criar
      // marca por conta própria no meio de uma operação em massa.
      skipped += 1;
      continue;
    }
    await prisma.product.update({
      where: { id: c.productId },
      data: { brandId: toId },
    });
    applied += 1;
  }
  return { applied, skipped };
}
