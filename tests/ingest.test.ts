import { describe, expect, it } from "vitest";

import {
  deriveCanonical,
  detectPrinterTech,
  inferProductFields,
} from "@/lib/ingest/create-product";
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

describe("inferProductFields (resina)", () => {
  it("impressora vira tipo PRINTER; outros equipamentos seguem excluídos", () => {
    expect(inferProductFields("Impressora 3D Resina Halot Mage Pro").kind).toBe(
      "PRINTER",
    );
    expect(inferProductFields("Impressora 3D Creality Ender 3 V3").kind).toBe(
      "PRINTER",
    );
    // Wash & Cure não é impressora nem insumo → excluído (OUTRO, não PRINTER).
    const wash = inferProductFields("Wash and Cure 3.0 Anycubic");
    expect(wash.kind).not.toBe("PRINTER");
    expect(wash.material).toBe("OUTRO");
  });

  it("detecta a tecnologia da impressora e não confunde 'para impressora'", () => {
    expect(detectPrinterTech("Impressora 3D Creality Ender 3 V3")).toBe("FDM");
    expect(detectPrinterTech("Impressora 3D Resina Elegoo Mars 4 LCD")).toBe(
      "Resina",
    );
    const f = inferProductFields(
      "Filamento PLA para impressora 3D Preto 1kg 1,75mm",
    );
    expect(f.kind).toBe("FILAMENT");
  });

  it("NÃO exclui insumo 'para impressora 3D'", () => {
    const f = inferProductFields("Filamento PLA para impressora 3D Preto 1kg 1,75mm");
    expect(f.material).toBe("PLA");
    expect(f.kind).toBe("FILAMENT");
  });

  it("classifica resina lavável / tough / standard", () => {
    expect(inferProductFields("Resina 3D Fila Water Washable Branca 1L").material).toBe(
      "RESIN_WATER_WASHABLE",
    );
    expect(inferProductFields("Resina PrintaLot Tough Transparente 500g").material).toBe(
      "RESIN_TOUGH",
    );
    expect(inferProductFields("Resina Premium Standard Cinza 1L").material).toBe(
      "RESIN_STANDARD",
    );
  });

  it("resina não tem diâmetro e lê volume em L/ml/g", () => {
    expect(inferProductFields("Resina Standard Cinza 2L").netWeightG).toBe(2000);
    expect(inferProductFields("Resina Standard Cinza 500ml").netWeightG).toBe(500);
    expect(inferProductFields("Resina Tough Transparente 500g").netWeightG).toBe(500);
    expect(inferProductFields("Resina Standard Cinza 1L").diameterMm).toBeNull();
    expect(inferProductFields("Resina Standard Cinza 1L").kind).toBe("RESIN");
  });

  it("detecta cores PT/EN e de resina (clear/incolor/skin)", () => {
    expect(inferProductFields("Resina Standard Clear 1L").color).toBe("Transparente");
    expect(inferProductFields("Resina Standard Incolor 1L").color).toBe("Transparente");
    expect(inferProductFields("Resina Skin Tom de Pele 500g").color).toBe("Bege");
    expect(inferProductFields("Filamento PLA Grey 1kg 1,75mm").color).toBe("Cinza");
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

  it("re-scrape NÃO duplica: candidato canonizado casa com o produto salvo", () => {
    // Produto como fica salvo após a criação: nome limpo + marca normalizada.
    const stored: ProductRef = {
      id: "abs1",
      name: "Filamento ABS Azul Céu",
      gtin: null,
      brandName: "3D Fila",
      signature: productSignature({
        name: "Filamento ABS Azul Céu",
        brand: "3D Fila",
        material: "ABS",
        netWeightG: 1000,
        diameterMm: 1.75,
      }),
    };
    // Re-scrape real: nome bruto com sufixo da loja e marca ausente (brand=null).
    const canon = deriveCanonical(
      "Filamento ABS Azul Céu - 3D Fila",
      null,
      "3D Fila Oficial",
    );
    expect(
      matchProduct({ name: canon.name, gtin: null, brand: canon.brandName }, [stored]),
    ).toBe("abs1");
  });
});
