import { describe, expect, it } from "vitest";

import type { ProductListItem } from "@/lib/catalog-types";
import {
  ROTATION_MS,
  compareAttractiveness,
  pickShowcase,
  pricePerKg,
} from "@/lib/showcase";

/** Produto mínimo para os testes; só os campos que a seleção olha importam. */
function p(
  id: string,
  bestPrice: number,
  netWeightG: number,
  discountPct = 0,
): ProductListItem {
  return {
    id,
    slug: id,
    name: id,
    kind: "FILAMENT",
    material: "PLA",
    color: "preto",
    tech: null,
    netWeightG,
    diameterMm: 1.75,
    imageUrl: null,
    brandName: "Marca",
    brandSlug: "marca",
    offerCount: 1,
    bestPrice,
    listPrice: bestPrice,
    bestPriceHasCoupon: discountPct > 0,
    discountPct,
    rating: null,
    reviewCount: 0,
    boost: null,
    sortOrder: 0,
    offers: [],
  };
}

describe("pricePerKg", () => {
  it("compara rolos de tamanhos diferentes", () => {
    // O caso real que motivou a mudança: 250g a R$ 54,90 parece mais barato
    // que 1kg a R$ 89,90, mas custa mais que o dobro por quilo.
    expect(pricePerKg(p("pequeno", 54.9, 250))).toBeCloseTo(219.6, 1);
    expect(pricePerKg(p("grande", 89.9, 1000))).toBeCloseTo(89.9, 1);
  });

  it("retorna null quando não há peso (impressora, acessório)", () => {
    expect(pricePerKg(p("impressora", 2500, 0))).toBeNull();
  });
});

describe("compareAttractiveness", () => {
  it("prefere o melhor preço por quilo, não o menor preço absoluto", () => {
    const rolinho = p("rolinho", 54.9, 250);
    const rolo = p("rolo", 89.9, 1000);
    expect([rolinho, rolo].sort(compareAttractiveness)[0].id).toBe("rolo");
  });

  it("põe o que tem desconto na frente", () => {
    const barato = p("barato", 80, 1000);
    const comDesconto = p("com-desconto", 100, 1000, 15);
    expect([barato, comDesconto].sort(compareAttractiveness)[0].id).toBe(
      "com-desconto",
    );
  });

  it("desempata de forma estável", () => {
    const a = p("aaa", 100, 1000);
    const b = p("bbb", 100, 1000);
    expect([b, a].sort(compareAttractiveness).map((x) => x.id)).toEqual([
      "aaa",
      "bbb",
    ]);
  });

  it("põe produto sem peso depois de quem tem peso conhecido", () => {
    const semPeso = p("sem-peso", 10, 0);
    const comPeso = p("com-peso", 500, 1000);
    expect([semPeso, comPeso].sort(compareAttractiveness)[0].id).toBe("com-peso");
  });
});

describe("pickShowcase", () => {
  const muitos = Array.from({ length: 40 }, (_, i) =>
    p(`p${String(i).padStart(2, "0")}`, 50 + i, 1000),
  );

  it("devolve a quantidade pedida", () => {
    expect(pickShowcase(muitos, 0, 8)).toHaveLength(8);
  });

  it("é estável dentro da mesma janela de rotação", () => {
    // Duas renderizações próximas precisam coincidir: a página é cacheada e
    // serviria conteúdos diferentes para visitantes simultâneos.
    const a = pickShowcase(muitos, ROTATION_MS * 3, 8);
    const b = pickShowcase(muitos, ROTATION_MS * 3 + 60_000, 8);
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it("muda de uma janela para a seguinte", () => {
    const a = pickShowcase(muitos, ROTATION_MS * 3, 8);
    const b = pickShowcase(muitos, ROTATION_MS * 4, 8);
    expect(a.map((x) => x.id)).not.toEqual(b.map((x) => x.id));
  });

  it("nunca repete produto na mesma vitrine", () => {
    for (const janela of [0, 5, 11, 23, 47]) {
      const ids = pickShowcase(muitos, ROTATION_MS * janela, 8).map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("gira apenas entre os melhores, não pelo catálogo inteiro", () => {
    // Com 40 produtos e conjunto de 24, os 16 piores nunca aparecem.
    const piores = new Set(muitos.slice(24).map((x) => x.id));
    for (const janela of [0, 7, 19, 31]) {
      const ids = pickShowcase(muitos, ROTATION_MS * janela, 8).map((x) => x.id);
      expect(ids.some((id) => piores.has(id))).toBe(false);
    }
  });

  it("não quebra com catálogo menor que a vitrine", () => {
    const poucos = muitos.slice(0, 3);
    expect(pickShowcase(poucos, 0, 8).map((x) => x.id)).toEqual([
      "p00",
      "p01",
      "p02",
    ]);
  });

  it("não quebra com catálogo vazio", () => {
    expect(pickShowcase([], 0, 8)).toEqual([]);
  });
});
