import type { ProductDetail } from "@/lib/catalog-types";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * JSON-LD do site (sitewide): Organization + WebSite com SearchAction.
 * Ajuda o Google a entender a marca e pode habilitar a caixa de busca nos
 * resultados (sitelinks searchbox). Já sanitizado contra XSS.
 */
export function siteJsonLd(): string {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Melhor Filamento",
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/logo.png`,
          width: 1024,
          height: 1024,
        },
        description:
          "Comparador de preços de filamentos, resinas e impressoras 3D no Brasil. Ranking por custo total para o seu CEP (preço + frete), comparação por preço/kg, histórico de ofertas, ferramentas e IA.",
        slogan: "Compare. Descubra. Compre melhor.",
        email: "contact@beadev.ai",
        areaServed: { "@type": "Country", name: "Brasil" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "atendimento ao cliente",
          email: "contact@beadev.ai",
          availableLanguage: ["Portuguese"],
        },
        sameAs: ["https://www.instagram.com/melhorfilamento3d/"],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "Melhor Filamento",
        url: base,
        inLanguage: "pt-BR",
        publisher: { "@id": `${base}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/busca?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * JSON-LD (schema.org) do produto: Product + AggregateOffer + Offers.
 * Já serializado e sanitizado contra XSS (escapa `<`).
 */
export function productJsonLd(product: ProductDetail): string {
  const url = `${siteUrl()}/produto/${product.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brandName },
    category:
      product.kind === "RESIN"
        ? "Resina para impressão 3D"
        : "Filamento para impressão 3D",
    url,
  };
  if (product.imageUrl) data.image = product.imageUrl;

  if (product.offers.length > 0) {
    const prices = product.offers.map((o) => o.effectivePrice);
    data.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: product.offers.length,
      availability: "https://schema.org/InStock",
      offers: product.offers.map((o) => ({
        "@type": "Offer",
        priceCurrency: "BRL",
        price: o.effectivePrice.toFixed(2),
        availability: "https://schema.org/InStock",
        url,
        seller: { "@type": "Organization", name: o.sellerName },
      })),
    };
  }

  return JSON.stringify(data).replace(/</g, "\\u003c");
}
