import type { ProductDetail } from "@/lib/catalog-types";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
