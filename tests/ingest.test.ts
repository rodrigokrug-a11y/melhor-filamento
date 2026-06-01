import { describe, expect, it } from "vitest";

import {
  matchProduct,
  normalizeText,
  productSignature,
  type ProductRef,
} from "@/lib/ingest/match";

const p1: ProductRef = {
  id: "p1",
  name: "Filamento PLA 3D Fila Preto 1kg (1,75mm)",
  gtin: "7891234567890",
  brandName: "3D Fila",
  signature: productSignature({
    name: "Filamento PLA 3D Fila Preto 1kg (1,75mm)",
    brand: "3D Fila",
    material: "PLA",
    netWeightG: 1000,
    diameterMm: 1.75,
  }),
};

const p2: ProductRef = {
  id: "p2",
  name: "Resina Voolt Standard Cinza 1L",
  gtin: null,
  brandName: "Voolt",
  signature: productSignature({
    name: "Resina Voolt Standard Cinza 1L",
    brand: "Voolt",
    material: "RESIN_STANDARD",
    netWeightG: 1000,
    diameterMm: null,
  }),
};

const index: ProductRef[] = [p1, p2];

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

  it("casa entre lojas pela assinatura (nome escrito diferente, mesmo produto)", () => {
    expect(
      matchProduct(
        { name: "PLA Preto 3D Fila 1kg 1,75mm", gtin: null, brand: "3D Fila" },
        index,
      ),
    ).toBe("p1");
  });

  it("NÃO funde cores/variações diferentes da mesma marca", () => {
    expect(
      matchProduct(
        { name: "Filamento PLA 3D Fila Branco 1kg 1,75mm", gtin: null, brand: "3D Fila" },
        index,
      ),
    ).toBeNull();
  });

  it("NÃO funde marcas diferentes do mesmo material/cor", () => {
    expect(
      matchProduct(
        { name: "Filamento PLA Voolt Preto 1kg 1,75mm", gtin: null, brand: "Voolt" },
        index,
      ),
    ).toBeNull();
  });

  it("retorna null sem correspondência", () => {
    expect(
      matchProduct({ name: "Produto inexistente", gtin: null, brand: null }, index),
    ).toBeNull();
  });
});
