import { describe, expect, it } from "vitest";

import { extractOffer } from "@/lib/scrape/extract";
import { parseCsvFeed, parseFeed } from "@/lib/scrape/feed";
import { parsePrice } from "@/lib/scrape/price";
import { isPathAllowed } from "@/lib/scrape/robots";
import { parseSitemap } from "@/lib/scrape/sitemap";

describe("parsePrice", () => {
  it("interpreta formato BR", () => {
    expect(parsePrice("R$ 129,90")).toBe(129.9);
    expect(parsePrice("1.234,56")).toBe(1234.56);
    expect(parsePrice("R$ 1.999,00")).toBe(1999);
  });

  it("interpreta formato US / schema.org", () => {
    expect(parsePrice("129.90")).toBe(129.9);
    expect(parsePrice("1,234.56")).toBe(1234.56);
    expect(parsePrice(99.9)).toBe(99.9);
  });

  it("milhar sem decimais", () => {
    expect(parsePrice("1.234")).toBe(1234);
  });

  it("retorna null para entradas inválidas", () => {
    expect(parsePrice("")).toBeNull();
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice("grátis")).toBeNull();
  });
});

describe("isPathAllowed", () => {
  const UA = "MelhorFilamentoBot/1.0";

  it("permite por padrão e bloqueia Disallow", () => {
    const txt = "User-agent: *\nDisallow: /admin\n";
    expect(isPathAllowed(txt, "/produto/x", UA)).toBe(true);
    expect(isPathAllowed(txt, "/admin/x", UA)).toBe(false);
  });

  it("Allow mais específico vence Disallow", () => {
    const txt = "User-agent: *\nDisallow: /\nAllow: /produto\n";
    expect(isPathAllowed(txt, "/produto/x", UA)).toBe(true);
    expect(isPathAllowed(txt, "/conta", UA)).toBe(false);
  });

  it("respeita um grupo específico do nosso bot", () => {
    const txt =
      "User-agent: melhorfilamentobot\nDisallow: /\n\nUser-agent: *\nAllow: /\n";
    expect(isPathAllowed(txt, "/x", UA)).toBe(false);
  });
});

describe("extractOffer", () => {
  it("lê preço de priceSpecification (WooCommerce, ex.: 3D Prime)", () => {
    const ld = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Impressora 3D Bambu Lab A1 MINI",
      offers: {
        "@type": "Offer",
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            price: "2319.00",
            priceCurrency: "BRL",
          },
        ],
        availability: "https://schema.org/OutOfStock",
      },
    };
    const html = `<html><head><script type="application/ld+json">${JSON.stringify(
      ld,
    )}</script></head><body></body></html>`;
    const r = extractOffer(html, "https://3dprime.com.br/produto/p/");
    expect(r?.price).toBe(2319);
    expect(r?.source).toBe("json-ld");
  });

  it("extrai de JSON-LD Product", () => {
    const ld = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Filamento PLA Preto 1kg",
      brand: { "@type": "Brand", name: "3D Fila" },
      gtin13: "7891234567890",
      image: "https://loja.example/img/pla.jpg",
      offers: {
        "@type": "Offer",
        price: "129.90",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    };
    const html = `<html><head><script type="application/ld+json">${JSON.stringify(
      ld,
    )}</script></head><body></body></html>`;
    const r = extractOffer(html, "https://loja.example/produto/pla");
    expect(r).toMatchObject({
      name: "Filamento PLA Preto 1kg",
      price: 129.9,
      currency: "BRL",
      availability: "IN_STOCK",
      brand: "3D Fila",
      gtin: "7891234567890",
      source: "json-ld",
    });
    expect(r.image).toBe("https://loja.example/img/pla.jpg");
  });

  it("extrai de ProductGroup (WooCommerce variável) — prioriza a variante de 1kg", () => {
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", name: "página" },
        {
          "@type": "ProductGroup",
          name: "Filamento PLA Amarelo",
          image: { "@id": "https://loja.example/img/pla-amarelo.jpg" },
          hasVariant: [
            {
              "@type": "Product",
              name: "PLA Amarelo 75g",
              offers: {
                "@type": "Offer",
                description: "PLA Amarelo 1,75mm 75g (amostra)",
                price: "6.9",
                priceCurrency: "BRL",
                availability: "http://schema.org/InStock",
              },
            },
            {
              "@type": "Product",
              name: "PLA Amarelo 1kg",
              offers: {
                "@type": "Offer",
                description: "PLA Amarelo 1,75mm 1kg",
                price: "89.9",
                priceCurrency: "BRL",
                availability: "http://schema.org/InStock",
              },
            },
          ],
        },
      ],
    };
    const html = `<html><head><script type="application/ld+json">${JSON.stringify(
      ld,
    )}</script></head><body></body></html>`;
    const r = extractOffer(html, "https://loja.example/produto/pla-amarelo");
    expect(r).toMatchObject({
      name: "Filamento PLA Amarelo",
      price: 89.9, // variante de 1kg (não a amostra de 75g a 6,90)
      currency: "BRL",
      availability: "IN_STOCK",
      source: "json-ld",
    });
    expect(r.image).toBe("https://loja.example/img/pla-amarelo.jpg");
  });

  it("extrai de OpenGraph e resolve imagem relativa", () => {
    const html = `<html><head>
      <meta property="og:title" content="Resina Cinza 1L">
      <meta property="og:image" content="/img/resina.png">
      <meta property="product:price:amount" content="159,90">
      <meta property="product:price:currency" content="BRL">
      <meta property="product:availability" content="instock">
    </head><body></body></html>`;
    const r = extractOffer(html, "https://loja.example/produto/resina");
    expect(r).toMatchObject({
      name: "Resina Cinza 1L",
      price: 159.9,
      currency: "BRL",
      availability: "IN_STOCK",
      source: "opengraph",
    });
    expect(r.image).toBe("https://loja.example/img/resina.png");
  });

  it("cai para seletores HTML genéricos", () => {
    const html = `<html><body><h1>Filamento ABS Cinza</h1><span class="product-price">R$ 89,90</span></body></html>`;
    const r = extractOffer(html, "https://loja.example/p/abs");
    expect(r).toMatchObject({
      name: "Filamento ABS Cinza",
      price: 89.9,
      source: "html",
    });
  });

  it("retorna source 'none' sem dados", () => {
    const r = extractOffer(
      "<html><body><p>nada por aqui</p></body></html>",
      "https://x.example/",
    );
    expect(r.source).toBe("none");
    expect(r.price).toBeNull();
  });
});

describe("parseFeed", () => {
  const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0"><channel>
<item>
  <g:id>1</g:id>
  <title>Filamento PLA Preto 1kg</title>
  <link>https://loja.example/produto/pla</link>
  <g:price>129.90 BRL</g:price>
  <g:image_link>https://loja.example/img/pla.jpg</g:image_link>
  <g:availability>in stock</g:availability>
  <g:brand>3D Fila</g:brand>
  <g:gtin>7891234567890</g:gtin>
</item>
<item>
  <title>Resina Cinza 1L</title>
  <link>/produto/resina</link>
  <g:price>159,90</g:price>
  <g:availability>out of stock</g:availability>
</item>
</channel></rss>`;

  it("lê itens de um feed Google Merchant", () => {
    const items = parseFeed(xml, "https://loja.example");
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      name: "Filamento PLA Preto 1kg",
      price: 129.9,
      currency: "BRL",
      availability: "IN_STOCK",
      brand: "3D Fila",
      gtin: "7891234567890",
      url: "https://loja.example/produto/pla",
    });
    expect(items[0].image).toBe("https://loja.example/img/pla.jpg");
    expect(items[1]).toMatchObject({
      name: "Resina Cinza 1L",
      price: 159.9,
      availability: "OUT_OF_STOCK",
      url: "https://loja.example/produto/resina",
    });
  });
});

describe("parseSitemap", () => {
  it("detecta índice de sitemaps", () => {
    const xml = `<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://loja.example/product-sitemap.xml</loc></sitemap></sitemapindex>`;
    const r = parseSitemap(xml);
    expect(r.kind).toBe("index");
    expect(r.urls).toEqual(["https://loja.example/product-sitemap.xml"]);
  });

  it("lê urlset de páginas", () => {
    const xml = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://loja.example/produto/a</loc></url><url><loc>https://loja.example/produto/b</loc></url></urlset>`;
    const r = parseSitemap(xml);
    expect(r.kind).toBe("urlset");
    expect(r.urls).toHaveLength(2);
  });
});

describe("parseCsvFeed", () => {
  it("lê datafeed CSV (vírgula)", () => {
    const csv = [
      "name,price,image,link,gtin,availability",
      "Filamento PLA Preto 1kg,129.90,https://loja.example/img/pla.jpg,https://loja.example/produto/pla,7891234567890,in stock",
    ].join("\n");
    const items = parseCsvFeed(csv, "https://loja.example");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: "Filamento PLA Preto 1kg",
      price: 129.9,
      gtin: "7891234567890",
      availability: "IN_STOCK",
      url: "https://loja.example/produto/pla",
    });
  });

  it("detecta delimitador ponto e vírgula e link relativo", () => {
    const csv = ["nome;preco;link", "Resina Cinza 1L;159,90;/produto/resina"].join(
      "\n",
    );
    const items = parseCsvFeed(csv, "https://loja.example");
    expect(items[0]).toMatchObject({
      name: "Resina Cinza 1L",
      price: 159.9,
      url: "https://loja.example/produto/resina",
    });
  });
});
