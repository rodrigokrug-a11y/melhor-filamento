// Frete por região — funções puras e testáveis.
// Resolução por especificidade: UF > REGION > NATIONAL.

export type Region = "N" | "NE" | "CO" | "SE" | "S";

export const REGION_LABELS: Record<Region, string> = {
  N: "Norte",
  NE: "Nordeste",
  CO: "Centro-Oeste",
  SE: "Sudeste",
  S: "Sul",
};

export const UF_TO_REGION: Record<string, Region> = {
  AC: "N",
  AP: "N",
  AM: "N",
  PA: "N",
  RO: "N",
  RR: "N",
  TO: "N",
  AL: "NE",
  BA: "NE",
  CE: "NE",
  MA: "NE",
  PB: "NE",
  PE: "NE",
  PI: "NE",
  RN: "NE",
  SE: "NE",
  DF: "CO",
  GO: "CO",
  MT: "CO",
  MS: "CO",
  ES: "SE",
  MG: "SE",
  RJ: "SE",
  SP: "SE",
  PR: "S",
  RS: "S",
  SC: "S",
};

export function deriveRegion(uf: string): Region | null {
  return UF_TO_REGION[uf.toUpperCase()] ?? null;
}

export type ShippingScope = "NATIONAL" | "REGION" | "UF";

export type ShippingRuleLite = {
  scope: ShippingScope;
  region: Region | null;
  uf: string | null;
  baseCost: number;
  freeShippingThreshold: number | null;
  estimatedDays: number;
};

export type ShippingEstimate = {
  cost: number;
  estimatedDays: number;
  free: boolean;
  scope: ShippingScope;
};

const SCOPE_SPECIFICITY: Record<ShippingScope, number> = {
  UF: 3,
  REGION: 2,
  NATIONAL: 1,
};

function matchesRegion(
  rule: ShippingRuleLite,
  ufUpper: string,
  region: Region | null,
): boolean {
  switch (rule.scope) {
    case "UF":
      return rule.uf?.toUpperCase() === ufUpper;
    case "REGION":
      return region != null && rule.region === region;
    case "NATIONAL":
      return true;
  }
}

/**
 * Melhor regra de frete para a UF, por especificidade (UF > REGION > NATIONAL).
 * Aplica frete grátis quando o subtotal atinge o limite da regra.
 * Retorna null quando nenhuma regra cobre a região (frete a calcular).
 */
export function estimateShipping(
  rules: ShippingRuleLite[],
  uf: string,
  subtotal: number,
): ShippingEstimate | null {
  const region = deriveRegion(uf);
  const ufUpper = uf.toUpperCase();

  let best: ShippingRuleLite | null = null;
  for (const rule of rules) {
    if (!matchesRegion(rule, ufUpper, region)) continue;
    if (
      !best ||
      SCOPE_SPECIFICITY[rule.scope] > SCOPE_SPECIFICITY[best.scope]
    ) {
      best = rule;
    }
  }
  if (!best) return null;

  const free =
    best.freeShippingThreshold != null &&
    subtotal >= best.freeShippingThreshold;
  return {
    cost: free ? 0 : best.baseCost,
    estimatedDays: best.estimatedDays,
    free,
    scope: best.scope,
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Custo total para a região = preço efetivo + frete.
 * Quando não há regra (shipping null), retorna o preço efetivo — o frete
 * é exibido como "a calcular" pela UI.
 */
export function totalForRegion(
  effectivePrice: number,
  shipping: ShippingEstimate | null,
): number {
  return round2(effectivePrice + (shipping?.cost ?? 0));
}
