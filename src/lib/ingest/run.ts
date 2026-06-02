import {
  createProductFromExtracted,
  deriveCanonical,
  inferProductFields,
} from "@/lib/ingest/create-product";
import { loadProductIndex, matchProduct, productSignature } from "@/lib/ingest/match";
import { prisma } from "@/lib/db";
import { extractOffer } from "@/lib/scrape/extract";
import { parseAnyFeed } from "@/lib/scrape/feed";
import { fetchPage } from "@/lib/scrape/fetch";
import { discoverUrls } from "@/lib/scrape/sitemap";
import type { Availability } from "@/lib/scrape/types";

export type IngestResult = {
  found: number;
  matched: number;
  created: number;
  upserted: number;
  unmatched: number;
  error?: string;
};

type Candidate = {
  name: string | null;
  price: number | null;
  image: string | null;
  availability: Availability;
  brand: string | null;
  gtin: string | null;
  url: string;
};

function stockFromAvailability(a: Availability) {
  if (a === "IN_STOCK") return "IN_STOCK" as const;
  if (a === "OUT_OF_STOCK") return "OUT_OF_STOCK" as const;
  return "UNKNOWN" as const;
}

async function upsertIngestedOffer(args: {
  sourceId: string;
  sellerId: string;
  productId: string;
  price: number;
  url: string;
  availability: Availability;
  image: string | null;
}): Promise<void> {
  const price = args.price.toFixed(2);
  const stockStatus = stockFromAvailability(args.availability);

  const existing = await prisma.offer.findFirst({
    where: { sourceId: args.sourceId, productId: args.productId },
    select: { id: true },
  });

  let offerId: string;
  if (existing) {
    await prisma.offer.update({
      where: { id: existing.id },
      data: { price, url: args.url, stockStatus },
    });
    offerId = existing.id;
  } else {
    // Ingestão é disparada pelo admin (fontes controladas) → já entra aprovada.
    const created = await prisma.offer.create({
      data: {
        sourceId: args.sourceId,
        sellerId: args.sellerId,
        productId: args.productId,
        price,
        url: args.url,
        stockStatus,
        status: "APPROVED",
      },
      select: { id: true },
    });
    offerId = created.id;
  }

  await prisma.priceSnapshot.create({ data: { offerId, price } });

  // Preenche a imagem do produto se ainda não houver uma.
  // Ignora cards sociais (og:image gerado) — não são fotos de produto.
  if (args.image && !/\/(opengraph-image|og-image|api\/og)\b/i.test(args.image)) {
    await prisma.product.updateMany({
      where: { id: args.productId, imageUrl: null },
      data: { imageUrl: args.image },
    });
  }
}

export async function ingestSource(sourceId: string): Promise<IngestResult> {
  const result: IngestResult = {
    found: 0,
    matched: 0,
    created: 0,
    upserted: 0,
    unmatched: 0,
  };

  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      sellerId: true,
      kind: true,
      url: true,
      seller: { select: { name: true } },
    },
  });
  if (!source) return { ...result, error: "Fonte não encontrada." };

  try {
    const index = await loadProductIndex();
    let candidates: Candidate[];

    if (source.kind === "FEED") {
      const { html } = await fetchPage(source.url, {
        accept: "any",
        maxBytes: 8_000_000,
      });
      candidates = parseAnyFeed(html, source.url).map((i) => ({
        name: i.name,
        price: i.price,
        image: i.image,
        availability: i.availability,
        brand: i.brand,
        gtin: i.gtin,
        url: i.url ?? source.url,
      }));
    } else if (source.kind === "SITEMAP") {
      // Filtro amplo de URL de produto: /produto/ (WooCommerce) e /prod-/ (Tray)
      // — cobre as plataformas comuns no Brasil sem puxar páginas/categorias.
      const urls = await discoverUrls(source.url, {
        limit: 250,
        maxFetches: 50,
        include: /produto|product|prod-/i,
      });
      candidates = [];
      for (const u of urls) {
        try {
          const { html, finalUrl } = await fetchPage(u);
          const offer = extractOffer(html, finalUrl);
          candidates.push({
            name: offer.name,
            price: offer.price,
            image: offer.image,
            availability: offer.availability,
            brand: offer.brand,
            gtin: offer.gtin,
            url: finalUrl,
          });
        } catch {
          // ignora páginas que falham
        }
      }
    } else {
      const { html, finalUrl } = await fetchPage(source.url);
      const offer = extractOffer(html, finalUrl);
      candidates = [
        {
          name: offer.name,
          price: offer.price,
          image: offer.image,
          availability: offer.availability,
          brand: offer.brand,
          gtin: offer.gtin,
          url: finalUrl,
        },
      ];
    }

    const sellerName = source.seller?.name ?? null;
    result.found = candidates.length;
    for (const c of candidates) {
      // Ignora sem preço ou preço zero (ex.: variável/fora de estoque sem valor).
      if (c.price == null || c.price <= 0 || !c.name) continue;
      // Canoniza nome+marca IGUAL à criação — senão o re-scrape não casa com o
      // produto já salvo (limpo/normalizado) e duplicaríamos a cada execução.
      const canon = deriveCanonical(c.name, c.brand, sellerName);
      let productId = matchProduct(
        { name: canon.name, gtin: c.gtin, brand: canon.brandName },
        index,
      );
      if (!productId) {
        // Cria se for filamento/resina (material conhecido) OU impressora.
        const fields = inferProductFields(c.name);
        if (fields.material === "OUTRO" && fields.kind !== "PRINTER") {
          result.unmatched += 1;
          continue;
        }
        const product = await createProductFromExtracted(
          {
            name: c.name,
            price: c.price,
            currency: null,
            image: c.image,
            availability: c.availability,
            brand: c.brand,
            gtin: c.gtin,
            source: "html",
          },
          sellerName,
        );
        productId = product.id;
        // Adiciona ao índice em memória p/ casar variações na mesma execução
        // (mesma canonização usada acima e no próximo loadProductIndex).
        index.push({
          id: product.id,
          name: product.name,
          gtin: c.gtin,
          brandName: canon.brandName,
          signature: productSignature({
            name: canon.name,
            brand: canon.brandName,
            material: fields.material,
            netWeightG: fields.netWeightG,
            diameterMm: fields.diameterMm,
          }),
        });
        result.created += 1;
      }
      result.matched += 1;
      await upsertIngestedOffer({
        sourceId: source.id,
        sellerId: source.sellerId,
        productId,
        price: c.price,
        url: c.url,
        availability: c.availability,
        image: c.image,
      });
      result.upserted += 1;
    }

    await prisma.source.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: `ok: ${result.upserted} oferta(s), ${result.created} novo(s) produto(s), ${result.unmatched} sem produto`,
        lastError: null,
      },
    });
  } catch (e) {
    result.error = e instanceof Error ? e.message : "Erro na ingestão.";
    await prisma.source.update({
      where: { id: source.id },
      data: { lastRunAt: new Date(), lastStatus: "erro", lastError: result.error },
    });
  }

  return result;
}

export async function runAllSources(): Promise<{
  sources: number;
  found: number;
  created: number;
  upserted: number;
  unmatched: number;
}> {
  const sources = await prisma.source.findMany({
    where: { enabled: true },
    select: { id: true },
  });
  const totals = {
    sources: sources.length,
    found: 0,
    created: 0,
    upserted: 0,
    unmatched: 0,
  };
  for (const s of sources) {
    const r = await ingestSource(s.id);
    totals.found += r.found;
    totals.created += r.created;
    totals.upserted += r.upserted;
    totals.unmatched += r.unmatched;
  }
  return totals;
}
