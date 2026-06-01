import { describe, expect, it } from "vitest";

import { matchProduct, normalizeText, type ProductRef } from "@/lib/ingest/match";

const index: ProductRef[] = [
  {
    id: "p1",
    name: "Filamento PLA 3D Fila Preto 1kg (1,75mm)",
    gtin: "7891234567890",
    brandName: "3D Fila",
  },
  {
    id: "p2",
    name: "Resina Voolt Standard Cinza 1L",
    gtin: null,
    brandName: "Voolt",
  },
];

describe("normalizeText", () => {
  it("remove acentos e pontuação", () => {
    expect(normalizeText("Resina Lavável (1,75mm)")).toBe("resina lavavel 1 75mm");
  });
});

describe("matchProduct", () => {
  it("casa por GTIN", () => {
    expect(
      matchProduct({ name: "outro nome", gtin: "7891234567890", brand: null }, index),
    ).toBe("p1");
  });

  it("casa por nome normalizado quando não há GTIN", () => {
    expect(
      matchProduct(
        { name: "resina voolt standard cinza 1l", gtin: null, brand: "Voolt" },
        index,
      ),
    ).toBe("p2");
  });

  it("retorna null sem correspondência", () => {
    expect(
      matchProduct({ name: "Produto inexistente", gtin: null, brand: null }, index),
    ).toBeNull();
  });
});
