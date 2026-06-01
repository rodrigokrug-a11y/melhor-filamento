// Lógica de preços do comparativo — funções puras, sem dependência de Prisma,
// para ficarem fáceis de testar. O frete por região entra na Etapa 3
// (ver `totalForRegion` em src/lib/shipping.ts).

export type CouponType = "PERCENT" | "FIXED";

export type CouponInput = {
  price: number;
  couponType?: CouponType | null;
  couponDiscount?: number | null;
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Valor (R$) do desconto do cupom, limitado ao preço (nunca deixa negativo). */
export function discountAmount({
  price,
  couponType,
  couponDiscount,
}: CouponInput): number {
  if (!couponType || !couponDiscount || couponDiscount <= 0) return 0;
  const raw =
    couponType === "PERCENT" ? (price * couponDiscount) / 100 : couponDiscount;
  return round2(Math.min(raw, price));
}

/** Preço já com o cupom aplicado (preço "para pagar"). */
export function effectivePrice(input: CouponInput): number {
  return round2(input.price - discountAmount(input));
}

/** Oferta entra no comparativo: aprovada e não esgotada. */
export function isOfferActive(
  status: string,
  stockStatus: string,
): boolean {
  return status === "APPROVED" && stockStatus !== "OUT_OF_STOCK";
}

/** Patrocínio vigente: marcada como patrocinada e dentro da janela. */
export function isSponsoredActive(
  isSponsored: boolean,
  sponsoredUntil?: Date | null,
  now: Date = new Date(),
): boolean {
  if (!isSponsored || !sponsoredUntil) return false;
  return sponsoredUntil.getTime() > now.getTime();
}

export type RankableOffer = {
  effectivePrice: number;
  sponsoredActive: boolean;
};

/**
 * Ordena ofertas: patrocinadas vigentes ocupam o topo (slot fixo),
 * o restante por menor preço efetivo. Empat­es mantêm ordem estável.
 */
export function rankOffers<T extends RankableOffer>(offers: T[]): T[] {
  return [...offers].sort((a, b) => {
    if (a.sponsoredActive !== b.sponsoredActive) {
      return a.sponsoredActive ? -1 : 1;
    }
    return a.effectivePrice - b.effectivePrice;
  });
}
