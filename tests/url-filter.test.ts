import { describe, expect, it } from "vitest";

import {
  DEFAULT_URL_FILTER,
  matchesUrlFilter,
  parseUrlFilter,
  urlFilterPredicate,
  validateUrlFilter,
} from "@/lib/ingest/url-filter";

describe("parseUrlFilter", () => {
  it("vazio, nulo ou só espaços caem no padrão", () => {
    // Nunca "não filtra nada": fonte sem filtro puxaria a loja inteira,
    // categorias e blog junto.
    expect(parseUrlFilter(null)).toEqual(DEFAULT_URL_FILTER);
    expect(parseUrlFilter("")).toEqual(DEFAULT_URL_FILTER);
    expect(parseUrlFilter("   ")).toEqual(DEFAULT_URL_FILTER);
    expect(parseUrlFilter(" , , ")).toEqual(DEFAULT_URL_FILTER);
  });

  it("separa por vírgula, apara espaços e normaliza a caixa", () => {
    expect(parseUrlFilter(" /Produto/ , /P/ ")).toEqual(["/produto/", "/p/"]);
  });
});

describe("matchesUrlFilter", () => {
  it("casa por trecho, em qualquer posição da URL", () => {
    const f = ["/produto/"];
    expect(matchesUrlFilter("https://loja.com.br/produto/pla-azul", f)).toBe(true);
    expect(matchesUrlFilter("https://loja.com.br/categoria/pla", f)).toBe(false);
  });

  it("ignora a caixa dos dois lados", () => {
    expect(matchesUrlFilter("https://Loja.com/PRODUTO/x", ["/produto/"])).toBe(true);
  });

  it("basta um trecho da lista bater", () => {
    const f = ["/produto/", "/p/"];
    expect(matchesUrlFilter("https://loja.com/p/abc", f)).toBe(true);
  });

  it("o padrão cobre WooCommerce e Tray", () => {
    const p = urlFilterPredicate(null);
    expect(p("https://loja.com.br/produto/filamento-pla")).toBe(true);
    expect(p("https://loja.com.br/prod-123-filamento")).toBe(true);
    expect(p("https://loja.com.br/product/pla")).toBe(true);
    expect(p("https://loja.com.br/blog/como-imprimir")).toBe(false);
  });

  it("loja com formato próprio passa a funcionar", () => {
    // É este o caso das fontes que voltavam vazias: o sitemap tem produtos,
    // mas a URL não contém nenhum dos trechos padrão.
    const url = "https://loja.com.br/loja/filamento-pla-azul";
    expect(urlFilterPredicate(null)(url)).toBe(false);
    expect(urlFilterPredicate("/loja/")(url)).toBe(true);
  });
});

describe("validateUrlFilter", () => {
  it("vazio guarda null (usa o padrão)", () => {
    expect(validateUrlFilter("")).toEqual({ value: null });
    expect(validateUrlFilter("   ")).toEqual({ value: null });
  });

  it("normaliza o que guarda", () => {
    expect(validateUrlFilter("  /Produto/ ,  /P/  ")).toEqual({
      value: "/produto/, /p/",
    });
  });

  it("recusa trecho de uma letra", () => {
    // "p" casaria com quase toda URL e traria o site inteiro — o oposto do que
    // o campo serve para fazer.
    const r = validateUrlFilter("/produto/, p");
    expect("error" in r).toBe(true);
  });

  it("recusa texto longo demais", () => {
    const r = validateUrlFilter("x".repeat(201));
    expect("error" in r).toBe(true);
  });
});
