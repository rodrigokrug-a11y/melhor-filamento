import { describe, expect, it } from "vitest";

import {
  type ShippingRuleLite,
  deriveRegion,
  estimateShipping,
  totalForRegion,
} from "@/lib/shipping";

describe("deriveRegion", () => {
  it("mapeia UF para macrorregião", () => {
    expect(deriveRegion("SP")).toBe("SE");
    expect(deriveRegion("rs")).toBe("S");
    expect(deriveRegion("BA")).toBe("NE");
    expect(deriveRegion("DF")).toBe("CO");
    expect(deriveRegion("AC")).toBe("N");
  });

  it("retorna null para UF inválida", () => {
    expect(deriveRegion("XX")).toBeNull();
  });
});

describe("estimateShipping", () => {
  const rules: ShippingRuleLite[] = [
    {
      scope: "NATIONAL",
      region: null,
      uf: null,
      baseCost: 25,
      freeShippingThreshold: 300,
      estimatedDays: 5,
    },
    {
      scope: "REGION",
      region: "SE",
      uf: null,
      baseCost: 15,
      freeShippingThreshold: 200,
      estimatedDays: 3,
    },
    {
      scope: "UF",
      region: null,
      uf: "SP",
      baseCost: 10,
      freeShippingThreshold: 150,
      estimatedDays: 2,
    },
  ];

  it("prefere a regra mais específica (UF > REGION > NATIONAL)", () => {
    const sp = estimateShipping(rules, "SP", 100);
    expect(sp).toMatchObject({ cost: 10, estimatedDays: 2, scope: "UF" });
  });

  it("cai para REGION quando não há UF específica", () => {
    const mg = estimateShipping(rules, "MG", 100);
    expect(mg).toMatchObject({ cost: 15, scope: "REGION" });
  });

  it("cai para NATIONAL fora da região coberta", () => {
    const ba = estimateShipping(rules, "BA", 100);
    expect(ba).toMatchObject({ cost: 25, scope: "NATIONAL" });
  });

  it("aplica frete grátis ao atingir o limite", () => {
    const sp = estimateShipping(rules, "SP", 150);
    expect(sp).toMatchObject({ cost: 0, free: true, scope: "UF" });
  });

  it("retorna null quando nenhuma regra cobre a região", () => {
    const onlySp: ShippingRuleLite[] = [
      {
        scope: "UF",
        region: null,
        uf: "SP",
        baseCost: 10,
        freeShippingThreshold: null,
        estimatedDays: 2,
      },
    ];
    expect(estimateShipping(onlySp, "RJ", 100)).toBeNull();
  });
});

describe("totalForRegion", () => {
  it("soma preço efetivo + frete", () => {
    expect(
      totalForRegion(89.91, {
        cost: 10,
        estimatedDays: 2,
        free: false,
        scope: "UF",
      }),
    ).toBe(99.91);
  });

  it("usa só o preço quando não há frete calculável", () => {
    expect(totalForRegion(89.91, null)).toBe(89.91);
  });
});
