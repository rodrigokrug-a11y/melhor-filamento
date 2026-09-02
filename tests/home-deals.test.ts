import { describe, expect, it } from "vitest";

import type { ProductListItem } from "@/lib/catalog-types";
import { buildPool, drawHomeDeals } from "@/lib/home-deals";

function product(id: string, price: number, extra: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id,
    slug: id,
    name: id,
    kind: "FILAMENT",
    material: "PLA",
    color: "Preto",
    tech: null,
    netWeightG: 1000,
    diameterMm: 1.75,
    imageUrl: null,
    brandName: "Marca",
    brandSlug: "marca",
    offerCount: 1,
    bestPrice: price,
    listPrice: price,
    bestPriceHasCoupon: false,
    discountPct: 0,
    rating: null,
    reviewCount: 0,
    boost: null,
    sortOrder: 0,
    offers: [],
    ...extra,
  };
}

const catalog = Array.from({ length: 40 }, (_, i) => product(`f${i}`, 50 + i));

describe("buildPool", () => {
  it("pega só os mais baratos", () => {
    const pool = buildPool(catalog, 10);
    expect(pool).toHaveLength(10);
    expect(pool.map((p) => p.id)).toEqual([
      "f0",
      "f1",
      "f2",
      "f3",
      "f4",
      "f5",
      "f6",
      "f7",
      "f8",
      "f9",
    ]);
  });

  it("mantém patrocinado e fixado fora da faixa barata", () => {
    const pool = buildPool(
      [...catalog, product("pago", 900, { boost: 120 }), product("fixado", 800, { sortOrder: 5 })],
      10,
    );
    expect(pool.map((p) => p.id)).toContain("pago");
    expect(pool.map((p) => p.id)).toContain("fixado");
    expect(pool).toHaveLength(12);
  });
});

describe("drawHomeDeals", () => {
  const pools = {
    filamentPool: buildPool(catalog, 28),
    resinPool: buildPool(
      Array.from({ length: 20 }, (_, i) => product(`r${i}`, 90 + i, { kind: "RESIN" })),
      18,
    ),
  };

  it("preenche as seções sem repetir produto", () => {
    const { hero, showcase, moreFilaments, moreResins } = drawHomeDeals(pools);
    expect(showcase).toHaveLength(8);
    expect(hero).toHaveLength(6);
    expect(moreFilaments).toHaveLength(4);
    expect(moreResins).toHaveLength(4);

    const ids = [...hero, ...showcase, ...moreFilaments, ...moreResins].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sorteia só dentro do pool e ordena a vitrine por preço", () => {
    const poolIds = new Set([...pools.filamentPool, ...pools.resinPool].map((p) => p.id));
    const { showcase } = drawHomeDeals(pools);
    for (const p of showcase) expect(poolIds.has(p.id)).toBe(true);
    const prices = showcase.map((p) => p.bestPrice);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("muda a combinação entre acessos", () => {
    const key = () =>
      drawHomeDeals(pools)
        .showcase.map((p) => p.id)
        .join(",");
    const draws = new Set(Array.from({ length: 12 }, key));
    expect(draws.size).toBeGreaterThan(1);
  });

  it("mostra os patrocinados na vitrine", () => {
    const paid = product("pago", 900, { boost: 120 });
    const { showcase } = drawHomeDeals({
      filamentPool: [...pools.filamentPool, paid],
      resinPool: pools.resinPool,
    });
    expect(showcase.map((p) => p.id)).toContain("pago");
  });

  it("não deixa o hero vazio com catálogo pequeno", () => {
    const { hero, showcase } = drawHomeDeals({
      filamentPool: catalog.slice(0, 3),
      resinPool: [],
    });
    expect(showcase).toHaveLength(3);
    expect(hero.length).toBeGreaterThanOrEqual(3);
  });
});
