import { describe, expect, it } from "vitest";
import { formatBRL } from "@/lib/utils";

// Smoke test — garante toolchain de testes + alias "@" funcionando.
// Os testes de regra de negócio (estimateShipping, totalForRegion) entram na Etapa 3.
describe("formatBRL", () => {
  it("formata número em BRL (pt-BR)", () => {
    expect(formatBRL(109.9)).toContain("109,90");
  });

  it("aceita string numérica", () => {
    expect(formatBRL("1234.5")).toContain("1.234,50");
  });
});
