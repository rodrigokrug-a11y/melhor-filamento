import { describe, expect, it } from "vitest";

import { DAY_MS, buildDailyMinSeries } from "@/lib/price-history";

// Janela fixa começando em 2026-03-01T00:00:00Z, para asserções legíveis.
const START = Date.UTC(2026, 2, 1);

/** Instante dentro do dia `n` da janela (0 = primeiro dia). */
function at(day: number, hour = 12): Date {
  return new Date(START + day * DAY_MS + hour * 60 * 60 * 1000);
}

describe("buildDailyMinSeries", () => {
  it("repete o último preço nos dias sem mudança", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "a", price: 100 }],
      changes: [],
      startDayMs: START,
      dayCount: 3,
    });

    expect(series).toEqual([
      { date: "2026-03-01", price: 100 },
      { date: "2026-03-02", price: 100 },
      { date: "2026-03-03", price: 100 },
    ]);
  });

  it("aplica a mudança a partir do dia em que ocorre", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "a", price: 100 }],
      changes: [{ offerId: "a", price: 80, at: at(2) }],
      startDayMs: START,
      dayCount: 4,
    });

    expect(series.map((p) => p.price)).toEqual([100, 100, 80, 80]);
  });

  it("omite os dias anteriores ao primeiro preço conhecido", () => {
    const series = buildDailyMinSeries({
      baseline: [],
      changes: [{ offerId: "a", price: 50, at: at(2) }],
      startDayMs: START,
      dayCount: 4,
    });

    // Sem baseline não havia preço a exibir nos dois primeiros dias.
    expect(series).toEqual([
      { date: "2026-03-03", price: 50 },
      { date: "2026-03-04", price: 50 },
    ]);
  });

  it("registra a mínima intradiária mesmo se o preço subir no mesmo dia", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "a", price: 100 }],
      changes: [
        { offerId: "a", price: 70, at: at(1, 9) },
        { offerId: "a", price: 90, at: at(1, 18) },
      ],
      startDayMs: START,
      dayCount: 3,
    });

    // Dia 1 chegou a 70 — a queda não pode sumir do gráfico só porque
    // o preço subiu de novo antes da meia-noite.
    expect(series.map((p) => p.price)).toEqual([100, 70, 90]);
  });

  it("aplica as mudanças do dia em ordem cronológica, não de chegada", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "a", price: 100 }],
      changes: [
        { offerId: "a", price: 90, at: at(1, 18) },
        { offerId: "a", price: 70, at: at(1, 9) },
      ],
      startDayMs: START,
      dayCount: 2,
    });

    // O preço que "fica" no fim do dia é o das 18h, não o do último item.
    expect(series.map((p) => p.price)).toEqual([100, 70]);
    const series2 = buildDailyMinSeries({
      baseline: [{ offerId: "a", price: 100 }],
      changes: [
        { offerId: "a", price: 90, at: at(1, 18) },
        { offerId: "a", price: 70, at: at(1, 9) },
      ],
      startDayMs: START,
      dayCount: 3,
    });
    expect(series2.map((p) => p.price)).toEqual([100, 70, 90]);
  });

  it("usa o menor preço entre as ofertas do produto", () => {
    const series = buildDailyMinSeries({
      baseline: [
        { offerId: "a", price: 100 },
        { offerId: "b", price: 120 },
      ],
      changes: [{ offerId: "b", price: 80, at: at(1) }],
      startDayMs: START,
      dayCount: 3,
    });

    // Dia 0: min(100, 120). Dia 1 em diante: a loja b passa a ser a mais barata.
    expect(series.map((p) => p.price)).toEqual([100, 80, 80]);
  });

  it("entra uma oferta nova no meio da janela sem apagar as existentes", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "a", price: 100 }],
      changes: [{ offerId: "nova", price: 130, at: at(1) }],
      startDayMs: START,
      dayCount: 3,
    });

    expect(series.map((p) => p.price)).toEqual([100, 100, 100]);
  });

  it("para de contar a oferta que sumiu da loja", () => {
    const series = buildDailyMinSeries({
      baseline: [
        { offerId: "sumiu", price: 50 },
        { offerId: "fica", price: 90 },
      ],
      changes: [],
      startDayMs: START,
      dayCount: 4,
      // "sumiu" foi vista pela última vez no dia 1 da janela.
      activeUntil: new Map([
        ["sumiu", START + DAY_MS],
        ["fica", null],
      ]),
    });

    // Enquanto existia ela era a mais barata; depois o menor preço real
    // passa a ser o da oferta que continua no ar.
    expect(series.map((p) => p.price)).toEqual([50, 50, 90, 90]);
  });

  it("não expira oferta sem data de verificação (cadastro manual)", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "manual", price: 40 }],
      changes: [],
      startDayMs: START,
      dayCount: 3,
      activeUntil: new Map([["manual", null]]),
    });

    expect(series.map((p) => p.price)).toEqual([40, 40, 40]);
  });

  it("omite o dia inteiro quando nenhuma oferta está ativa", () => {
    const series = buildDailyMinSeries({
      baseline: [{ offerId: "sumiu", price: 50 }],
      changes: [],
      startDayMs: START,
      dayCount: 3,
      activeUntil: new Map([["sumiu", START]]),
    });

    // Só o primeiro dia tem preço; depois não há oferta alguma a exibir.
    expect(series).toEqual([{ date: "2026-03-01", price: 50 }]);
  });

  it("retorna vazio quando não há baseline nem mudanças", () => {
    expect(
      buildDailyMinSeries({
        baseline: [],
        changes: [],
        startDayMs: START,
        dayCount: 5,
      }),
    ).toEqual([]);
  });
});
