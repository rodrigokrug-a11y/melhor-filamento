import { describe, expect, it } from "vitest";

import { UNVERIFIED_OFFER_DAYS, offerFreshness } from "@/lib/catalog-types";

const NOW = Date.UTC(2026, 2, 20, 12, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO de `days` dias antes de NOW. */
function daysAgo(days: number): string {
  return new Date(NOW - days * DAY_MS).toISOString();
}

describe("offerFreshness", () => {
  it("não promete data para oferta cadastrada à mão", () => {
    // lastSeenAt nulo = nunca passou pela ingestão; não há o que verificar.
    expect(offerFreshness(null, NOW)).toBeNull();
  });

  it("ignora data inválida em vez de exibir NaN", () => {
    expect(offerFreshness("não é uma data", NOW)).toBeNull();
  });

  it("descreve a idade em linguagem natural", () => {
    expect(offerFreshness(daysAgo(0), NOW)?.label).toBe("preço verificado hoje");
    expect(offerFreshness(daysAgo(1), NOW)?.label).toBe("preço verificado ontem");
    expect(offerFreshness(daysAgo(4), NOW)?.label).toBe(
      "preço verificado há 4 dias",
    );
  });

  it("trata data no futuro como hoje", () => {
    // Divergência de relógio não pode virar "há -1 dias".
    const future = new Date(NOW + 2 * DAY_MS).toISOString();
    expect(offerFreshness(future, NOW)).toEqual({
      label: "preço verificado hoje",
      stale: false,
    });
  });

  it("marca como não confiável a partir do limite configurado", () => {
    expect(offerFreshness(daysAgo(UNVERIFIED_OFFER_DAYS - 1), NOW)?.stale).toBe(
      false,
    );
    expect(offerFreshness(daysAgo(UNVERIFIED_OFFER_DAYS), NOW)?.stale).toBe(true);
    expect(offerFreshness(daysAgo(UNVERIFIED_OFFER_DAYS + 10), NOW)?.stale).toBe(
      true,
    );
  });
});
