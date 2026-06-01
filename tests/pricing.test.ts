import { describe, expect, it } from "vitest";

import {
  discountAmount,
  effectivePrice,
  isOfferActive,
  isSponsoredActive,
  rankOffers,
} from "@/lib/pricing";

describe("discountAmount", () => {
  it("retorna 0 sem cupom", () => {
    expect(discountAmount({ price: 100 })).toBe(0);
    expect(
      discountAmount({ price: 100, couponType: "PERCENT", couponDiscount: 0 }),
    ).toBe(0);
  });

  it("aplica desconto percentual", () => {
    expect(
      discountAmount({ price: 99.9, couponType: "PERCENT", couponDiscount: 10 }),
    ).toBe(9.99);
  });

  it("aplica desconto fixo", () => {
    expect(
      discountAmount({ price: 105, couponType: "FIXED", couponDiscount: 5 }),
    ).toBe(5);
  });

  it("limita o desconto ao preço (nunca negativo)", () => {
    expect(
      discountAmount({ price: 20, couponType: "FIXED", couponDiscount: 50 }),
    ).toBe(20);
  });
});

describe("effectivePrice", () => {
  it("subtrai o cupom do preço", () => {
    expect(
      effectivePrice({ price: 99.9, couponType: "PERCENT", couponDiscount: 10 }),
    ).toBe(89.91);
  });

  it("mantém o preço quando não há cupom", () => {
    expect(effectivePrice({ price: 109.9 })).toBe(109.9);
  });
});

describe("isOfferActive", () => {
  it("aprovada e em estoque entra", () => {
    expect(isOfferActive("APPROVED", "IN_STOCK")).toBe(true);
    expect(isOfferActive("APPROVED", "UNKNOWN")).toBe(true);
  });

  it("pendente ou esgotada não entra", () => {
    expect(isOfferActive("PENDING", "IN_STOCK")).toBe(false);
    expect(isOfferActive("APPROVED", "OUT_OF_STOCK")).toBe(false);
  });
});

describe("isSponsoredActive", () => {
  const now = new Date("2026-05-29T00:00:00Z");

  it("vigente quando dentro da janela", () => {
    expect(
      isSponsoredActive(true, new Date("2026-06-29T00:00:00Z"), now),
    ).toBe(true);
  });

  it("não vigente quando expirado, sem data ou não patrocinado", () => {
    expect(
      isSponsoredActive(true, new Date("2026-05-01T00:00:00Z"), now),
    ).toBe(false);
    expect(isSponsoredActive(true, null, now)).toBe(false);
    expect(
      isSponsoredActive(false, new Date("2026-06-29T00:00:00Z"), now),
    ).toBe(false);
  });
});

describe("rankOffers", () => {
  it("patrocinada vai ao topo, resto por menor preço", () => {
    const ranked = rankOffers([
      { id: "a", effectivePrice: 90, sponsoredActive: false },
      { id: "b", effectivePrice: 120, sponsoredActive: true },
      { id: "c", effectivePrice: 100, sponsoredActive: false },
    ]);
    expect(ranked.map((o) => o.id)).toEqual(["b", "a", "c"]);
  });
});
