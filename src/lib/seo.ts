import type { ProductDetail } from "@/lib/catalog-types";
import type { Guia } from "@/lib/guias";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    // Sem a env, em produção cai para o domínio real (não "localhost", que
    // envenenaria todos os canonical/JSON-LD); em dev, localhost.
    (process.env.NODE_ENV === "production"
      ? "https://melhorfilamento.com.br"
      : "http://localhost:3000")
  );
}

/**
 * JSON-LD de trilha de navegação (BreadcrumbList). Habilita a trilha no
 * resultado de busca e ajuda o Google a entender a hierarquia do site.
 * `crumbs` em ordem (raiz → atual); cada item com nome e caminho relativo.
 */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]): string {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${base}${c.path}`,
    })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * JSON-LD de uma listagem/catálogo: CollectionPage + ItemList (produtos
 * visíveis) + BreadcrumbList (Início → categoria). Ajuda o Google a entender
 * que a página é uma coleção e a indexar os produtos linkados.
 */
export function catalogJsonLd(opts: {
  name: string;
  path: string;
  description: string;
  items: { name: string; slug: string }[];
}): string {
  const base = siteUrl();
  const url = `${base}${opts.path}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: opts.name,
        url,
        description: opts.description,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: opts.items.length,
          itemListElement: opts.items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${base}/produto/${it.slug}`,
            name: it.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: `${base}/` },
          { "@type": "ListItem", position: 2, name: opts.name, item: url },
        ],
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
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
 * JSON-LD de um Guia editorial: Article + BreadcrumbList + FAQPage (quando há
 * perguntas). Ajuda o Google a entender o conteúdo e habilita rich results de
 * FAQ e breadcrumb. Já serializado e sanitizado contra XSS.
 */
export function guiaJsonLd(guia: Guia): string {
  const base = siteUrl();
  const url = `${base}/guias/${guia.slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: guia.titulo,
      description: guia.descricao,
      inLanguage: "pt-BR",
      datePublished: guia.atualizadoEm,
      dateModified: guia.atualizadoEm,
      mainEntityOfPage: url,
      author: { "@id": `${base}/#organization` },
      publisher: { "@id": `${base}/#organization` },
      image: `${base}/logo.png`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: base },
        { "@type": "ListItem", position: 2, name: "Guias", item: `${base}/guias` },
        { "@type": "ListItem", position: 3, name: guia.titulo, item: url },
      ],
    },
  ];

  if (guia.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: guia.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c",
  );
}

/**
 * JSON-LD (schema.org) do produto: Product + AggregateOffer + Offers.
 * Já serializado e sanitizado contra XSS (escapa `<`).
 */
export function productJsonLd(
  product: ProductDetail,
  rating?: { average: number | null; count: number },
): string {
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
    // Validade do preço (~30 dias) — sem ela o Google trata a oferta como
    // possivelmente expirada e suprime o rich result de preço.
    const validUntil = new Date(Date.now() + 30 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    data.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: product.offers.length,
      availability: "https://schema.org/InStock",
      priceValidUntil: validUntil,
      offers: product.offers.map((o) => ({
        "@type": "Offer",
        priceCurrency: "BRL",
        price: o.effectivePrice.toFixed(2),
        priceValidUntil: validUntil,
        availability: "https://schema.org/InStock",
        url,
        seller: { "@type": "Organization", name: o.sellerName },
      })),
    };
  }

  // AggregateRating → estrelas no resultado de busca (rich result). Só quando
  // há avaliações reais (Google rejeita rating sem reviews).
  if (rating && rating.average != null && rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average.toFixed(1),
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return JSON.stringify(data).replace(/</g, "\\u003c");
}
