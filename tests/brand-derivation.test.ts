import { describe, expect, it } from "vitest";

import {
  brandFromKnown,
  deriveCanonical,
  SEED_3D_BRANDS,
} from "@/lib/ingest/create-product";

// Casos tirados do catálogo de produção (diagnóstico de 2026-09-02), onde 495
// filamentos estavam distribuídos em apenas 6 marcas.
describe("marca derivada do título", () => {
  it("fabricante no título vence a loja que se anuncia como marca", () => {
    // Este é o caso real: a 3D Prime publica "3D Prime" como brand no JSON-LD
    // de um filamento que é da Bambu Lab, e o título diz isso em letras claras.
    expect(
      deriveCanonical(
        "Filamento - Bambu Lab - TPU-AMS – Cinza",
        "3D Prime",
        "3D Prime",
      ).brandName,
    ).toBe("Bambu Lab");
  });

  it("marca extraída que NÃO é a loja continua mandando", () => {
    // O sinal da loja só é descartado quando ela aponta para si mesma; uma
    // marca de verdade no JSON-LD segue sendo a melhor fonte.
    expect(
      deriveCanonical("PLA Premium HT Grafite", "Polymaker", "3D Prime")
        .brandName,
    ).toBe("Polymaker");
  });

  it("produto de marca própria continua com o nome da loja", () => {
    // A 3D Prime fabrica o que vende: virar marca aqui é o certo, e a correção
    // acima não pode levar esses 116 produtos junto.
    expect(
      deriveCanonical("PLA Basic Rosa", "3D Prime", "3D Prime").brandName,
    ).toBe("3D Prime");
    expect(
      deriveCanonical(
        "Filamento ABS Premium MG-94 | VERDE KAWASAKI | 1,75mm | 1kg",
        null,
        "National 3D",
      ).brandName,
    ).toBe("National 3D");
  });

  it("nome de loja que contém marca conhecida vira a marca conhecida", () => {
    // "eSUN Brasil" é a loja; a marca é "eSun", que já tem 178 produtos. Sem
    // isso nasce uma segunda marca quase idêntica ao lado da primeira.
    expect(
      deriveCanonical("Filamento Refil 1kg", null, "eSUN Brasil").brandName,
    ).toBe("eSun");
  });

  it("…mesmo quando a própria loja já está cadastrada como marca", () => {
    // Em produção "eSUN Brasil" existe na tabela Brand. Sendo o nome mais
    // longo, ela casaria consigo mesma e o "eSun" de dentro sumiria — foi
    // exatamente assim que 18 produtos foram parar numa marca duplicada.
    expect(
      deriveCanonical("Filamento Refil 1kg", null, "eSUN Brasil", [
        ...SEED_3D_BRANDS,
        "eSUN Brasil",
      ]).brandName,
    ).toBe("eSun");
  });

  it("sem nada reconhecível, cai na loja", () => {
    expect(
      deriveCanonical("Filamento PLA Preto 1kg", null, "Loja Qualquer")
        .brandName,
    ).toBe("Loja Qualquer");
  });

  it("sem loja nem marca, fica Sem marca", () => {
    expect(deriveCanonical("Filamento PLA Preto 1kg", null, null).brandName).toBe(
      "Sem marca",
    );
  });
});

describe("lista de marcas conhecidas", () => {
  it("usa a lista recebida, não só a semente embutida", () => {
    // O ganho todo da mudança: marca cadastrada no admin passa a ser
    // reconhecida sem tocar em código.
    expect(brandFromKnown("Filamento Masterprint PLA Azul")).toBeNull();
    expect(
      brandFromKnown("Filamento Masterprint PLA Azul", [
        ...SEED_3D_BRANDS,
        "Masterprint",
      ]),
    ).toBe("Masterprint");
  });

  it("prefere o nome mais longo que casa", () => {
    // Com "3D Lab" e "3D Lab Filamentos" cadastrados, a ordem do array não pode
    // decidir qual vence: a marca mais específica é a informação melhor.
    const known = ["3D Lab", "3D Lab Filamentos"];
    expect(brandFromKnown("Filamento 3D Lab Filamentos PLA", known)).toBe(
      "3D Lab Filamentos",
    );
    expect(brandFromKnown("Filamento 3D Lab Filamentos PLA", [...known].reverse())).toBe(
      "3D Lab Filamentos",
    );
  });

  it("casa palavra inteira, não pedaço de outra", () => {
    // "F3D" não pode ser encontrado dentro de "EVO3D".
    expect(brandFromKnown("Impressora EVO3D X1", ["F3D"])).toBeNull();
    expect(brandFromKnown("Filamento F3D PLA", ["F3D"])).toBe("F3D");
  });

  it("ignora caixa", () => {
    expect(brandFromKnown("filamento bambu lab pla")).toBe("Bambu Lab");
  });
});

describe("nome do produto", () => {
  it("não muda quando a marca vencedora muda", () => {
    // O casamento por nome é a última rede de segurança do re-scrape. Se o nome
    // mudasse junto com a marca, cada produto reclassificado viraria dois.
    const raw = "Filamento Masterprint PLA Azul Céu - Revenda XYZ";
    // Antes: nenhuma marca conhecida no título, então o sufixo "- Revenda XYZ"
    // era lido como marca. Depois: "Masterprint" está cadastrada e vence.
    const antes = deriveCanonical(raw, null, "Loja Qualquer");
    const depois = deriveCanonical(raw, null, "Loja Qualquer", [
      ...SEED_3D_BRANDS,
      "Masterprint",
    ]);
    expect(antes.brandName).toBe("Revenda XYZ");
    expect(depois.brandName).toBe("Masterprint");
    expect(antes.name).toBe(depois.name);
    expect(depois.name).toBe("Filamento Masterprint PLA Azul Céu");
  });
});
