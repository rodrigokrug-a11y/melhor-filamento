import { describe, expect, it } from "vitest";

import { estimateCost, fillDays } from "@/lib/ai-stats";

const START = Date.UTC(2026, 8, 1); // 2026-09-01

describe("estimateCost", () => {
  it("cobra entrada e saída a preços diferentes", () => {
    // Haiku 4.5: US$ 1,00/M entrada e US$ 5,00/M saída.
    expect(estimateCost(1_000_000, 0)).toBeCloseTo(1, 6);
    expect(estimateCost(0, 1_000_000)).toBeCloseTo(5, 6);
    expect(estimateCost(1_000_000, 1_000_000)).toBeCloseTo(6, 6);
  });

  it("escala para volumes pequenos sem arredondar para zero", () => {
    // Uma conversa típica não pode sumir da conta por ser barata.
    expect(estimateCost(2_000, 800)).toBeCloseTo(0.002 + 0.004, 6);
  });

  it("é zero sem tokens", () => {
    expect(estimateCost(0, 0)).toBe(0);
  });
});

describe("fillDays", () => {
  it("preenche com zero os dias sem uso", () => {
    // O dia parado é justamente a informação que interessa num painel de
    // adoção; se ele sumisse da série, o gráfico mentiria por omissão.
    const out = fillDays([{ date: "2026-09-02", calls: 7 }], START, 4);
    expect(out).toEqual([
      { date: "2026-09-01", calls: 0 },
      { date: "2026-09-02", calls: 7 },
      { date: "2026-09-03", calls: 0 },
      { date: "2026-09-04", calls: 0 },
    ]);
  });

  it("devolve exatamente a quantidade de dias pedida", () => {
    expect(fillDays([], START, 30)).toHaveLength(30);
  });

  it("ignora datas fora da janela", () => {
    const out = fillDays(
      [
        { date: "2026-08-20", calls: 99 }, // antes do início
        { date: "2026-09-01", calls: 3 },
      ],
      START,
      2,
    );
    expect(out).toEqual([
      { date: "2026-09-01", calls: 3 },
      { date: "2026-09-02", calls: 0 },
    ]);
  });

  it("mantém a ordem cronológica mesmo com entrada desordenada", () => {
    const out = fillDays(
      [
        { date: "2026-09-03", calls: 2 },
        { date: "2026-09-01", calls: 1 },
      ],
      START,
      3,
    );
    expect(out.map((d) => d.date)).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
    expect(out.map((d) => d.calls)).toEqual([1, 0, 2]);
  });

  it("atravessa virada de mês", () => {
    const out = fillDays([], Date.UTC(2026, 8, 29), 4);
    expect(out.map((d) => d.date)).toEqual([
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ]);
  });
});
