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
  /** Encerrada por prazo antes de varrer a fonte inteira. */
  truncated?: boolean;
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
    select: { id: true, price: true },
  });

  let offerId: string;
  // Snapshot só quando o preço muda: um ponto por execução faria a tabela
  // crescer sem limite repetindo o mesmo valor. O histórico é uma série de
  // degraus — `buildDailyMinSeries` repete o último preço nos dias sem ponto.
  let priceChanged: boolean;
  // Carimbo de "vi esta oferta agora": é o que permite expirar oferta que
  // sumiu da loja em vez de deixá-la publicada com preço velho para sempre.
  const lastSeenAt = new Date();
  if (existing) {
    priceChanged = Number(existing.price) !== Number(price);
    await prisma.offer.update({
      where: { id: existing.id },
      data: { price, url: args.url, stockStatus, lastSeenAt },
    });
    offerId = existing.id;
  } else {
    priceChanged = true; // primeira leitura: registra o ponto inicial da série
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
        lastSeenAt,
      },
      select: { id: true },
    });
    offerId = created.id;
  }

  if (priceChanged) {
    await prisma.priceSnapshot.create({ data: { offerId, price } });
  }

  // Preenche a imagem do produto se ainda não houver uma.
  // Ignora cards sociais (og:image gerado) — não são fotos de produto.
  if (args.image && !/\/(opengraph-image|og-image|api\/og)\b/i.test(args.image)) {
    await prisma.product.updateMany({
      where: { id: args.productId, imageUrl: null },
      data: { imageUrl: args.image },
    });
  }
}

export async function ingestSource(
  sourceId: string,
  opts: { deadlineAt?: number } = {},
): Promise<IngestResult> {
  const expired = () => opts.deadlineAt != null && Date.now() >= opts.deadlineAt;

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
        // Sem esta checagem, uma única fonte SITEMAP com centenas de páginas
        // consome o prazo inteiro e as fontes seguintes nunca rodam.
        if (expired()) {
          result.truncated = true;
          break;
        }
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
        lastStatus: `${result.truncated ? "parcial" : "ok"}: ${result.upserted} oferta(s), ${result.created} novo(s) produto(s), ${result.unmatched} sem produto`,
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

/** Quantos domínios diferentes raspar ao mesmo tempo. */
const HOST_CONCURRENCY = 4;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** Executa `fn` sobre `items` com no máximo `limit` execuções simultâneas. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await fn(items[i]);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

export type RunAllResult = {
  sources: number;
  found: number;
  created: number;
  upserted: number;
  unmatched: number;
  /** Fontes que não chegaram a rodar por estouro de prazo. */
  skipped: number;
};

/**
 * Roda todas as fontes ativas.
 *
 * Fontes do mesmo domínio rodam em série (não martelar a mesma loja), mas
 * domínios diferentes rodam em paralelo — o custo aqui é quase todo espera de
 * rede, então serializar tudo desperdiça o tempo da função.
 *
 * `deadlineMs` limita o tempo total: ao estourar, as fontes restantes são
 * contadas em `skipped` em vez de o processo ser morto no meio pelo timeout
 * da plataforma, que deixaria fontes com status desatualizado e sem sinal.
 */
export async function runAllSources(
  opts: { deadlineMs?: number } = {},
): Promise<RunAllResult> {
  const startedAt = Date.now();
  const deadlineMs = opts.deadlineMs ?? Infinity;

  // Ordem por antiguidade, não a ordem natural da tabela: quando o prazo
  // estoura, quem for cortado é sempre o mesmo se a ordem for fixa — foi o que
  // deixou eSUN e 3D Fila uma hora atrás das demais. Assim a fila gira.
  const sources = await prisma.source.findMany({
    where: { enabled: true },
    select: { id: true, url: true },
    orderBy: { lastRunAt: { sort: "asc", nulls: "first" } },
  });

  const byHost = new Map<string, string[]>();
  for (const s of sources) {
    const host = hostOf(s.url);
    const group = byHost.get(host);
    if (group) group.push(s.id);
    else byHost.set(host, [s.id]);
  }

  const totals: RunAllResult = {
    sources: sources.length,
    found: 0,
    created: 0,
    upserted: 0,
    unmatched: 0,
    skipped: 0,
  };

  const perGroup = await mapWithConcurrency(
    [...byHost.values()],
    HOST_CONCURRENCY,
    async (ids) => {
      const acc = { found: 0, created: 0, upserted: 0, unmatched: 0, skipped: 0 };
      for (const id of ids) {
        if (Date.now() - startedAt >= deadlineMs) {
          acc.skipped += 1;
          continue;
        }
        // O prazo desce junto: sem isso, uma fonte com centenas de páginas
        // ignora o limite e leva o processo inteiro junto.
        const r = await ingestSource(id, { deadlineAt: startedAt + deadlineMs });
        acc.found += r.found;
        acc.created += r.created;
        acc.upserted += r.upserted;
        acc.unmatched += r.unmatched;
      }
      return acc;
    },
  );

  for (const g of perGroup) {
    totals.found += g.found;
    totals.created += g.created;
    totals.upserted += g.upserted;
    totals.unmatched += g.unmatched;
    totals.skipped += g.skipped;
  }

  return totals;
}
