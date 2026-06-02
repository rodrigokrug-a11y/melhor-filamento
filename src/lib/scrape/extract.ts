import * as cheerio from "cheerio";

import { parsePrice } from "@/lib/scrape/price";
import type {
  ExtractSource,
  ExtractedOffer,
  PartialOffer,
} from "@/lib/scrape/types";
import { absoluteUrl, mapAvailability } from "@/lib/scrape/util";

type Json = Record<string, unknown>;

function asRecord(v: unknown): Json | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function firstOf(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}

// ───────────── JSON-LD ─────────────

function typesOf(node: Json): string[] {
  const t = node["@type"];
  if (Array.isArray(t)) return t.map((x) => String(x).toLowerCase());
  if (typeof t === "string") return [t.toLowerCase()];
  return [];
}

function flattenLd(data: unknown, out: Json[]): void {
  if (Array.isArray(data)) {
    for (const d of data) flattenLd(d, out);
    return;
  }
  const obj = asRecord(data);
  if (!obj) return;
  if (Array.isArray(obj["@graph"])) flattenLd(obj["@graph"], out);
  out.push(obj);
}

function imageFromLd(v: unknown): string | null {
  const first = firstOf(v);
  if (typeof first === "string") return first;
  const rec = asRecord(first);
  return rec ? (asString(rec.url) ?? asString(rec["@id"])) : null;
}

/**
 * Resolve a oferta de um Product OU ProductGroup (produto variável da WooCommerce).
 * Quando há variantes (hasVariant), escolhe a de menor preço em estoque.
 */
function offerFromNode(node: Json): Json | null {
  const direct = asRecord(firstOf(node.offers));
  if (direct) return direct;

  const raw = node.hasVariant;
  const variants = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map(asRecord)
    .filter((v): v is Json => v !== null);
  const offers = variants
    .map((v) => asRecord(firstOf(v.offers)))
    .filter((o): o is Json => o !== null);
  if (offers.length === 0) return null;

  const text = (o: Json) =>
    `${asString(o.description) ?? ""} ${asString(o.name) ?? ""}`;
  const isOneKg = (o: Json) => /\b1\s*kg\b|1[.,]0\s*kg|1000\s*g/i.test(text(o));
  // Considera SOMENTE a variante de 1kg (1000g). Se não houver, não há oferta
  // — o produto é ignorado na importação (padronização do catálogo em 1kg).
  return offers.find(isOneKg) ?? null;
}
function brandFromLd(v: unknown): string | null {
  if (typeof v === "string") return v.trim() || null;
  const rec = asRecord(v);
  return rec ? asString(rec.name) : null;
}
function gtinFromLd(p: Json): string | null {
  for (const key of ["gtin13", "gtin", "gtin12", "gtin14", "gtin8", "ean", "mpn"]) {
    const val = asString(p[key]);
    if (val) return val;
  }
  return null;
}

function extractFromJsonLd($: cheerio.CheerioAPI, base: string): PartialOffer | null {
  const nodes: Json[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = $(el).text();
    if (!txt.trim()) return;
    try {
      flattenLd(JSON.parse(txt), nodes);
    } catch {
      // ignora JSON-LD malformado
    }
  });

  const product = nodes.find((n) => {
    const t = typesOf(n);
    return t.includes("product") || t.includes("productgroup");
  });
  if (!product) return null;

  const offer = offerFromNode(product);
  // Alguns WooCommerce guardam o preço em priceSpecification (UnitPriceSpecification),
  // não em offer.price — ex.: 3D Prime.
  const priceSpec = asRecord(firstOf(offer?.priceSpecification));
  const price = parsePrice(
    asString(offer?.price) ??
      asString(offer?.lowPrice) ??
      asString(priceSpec?.price) ??
      null,
  );

  return {
    name: asString(product.name),
    price,
    currency: asString(offer?.priceCurrency),
    image: absoluteUrl(imageFromLd(product.image), base),
    availability: mapAvailability(offer?.availability),
    brand: brandFromLd(product.brand),
    gtin: gtinFromLd(product),
  };
}

// ───────────── OpenGraph / meta ─────────────

function metaContent($: cheerio.CheerioAPI, selector: string): string | null {
  return asString($(selector).first().attr("content"));
}

function extractFromMeta($: cheerio.CheerioAPI, base: string): PartialOffer | null {
  const name =
    metaContent($, 'meta[property="og:title"]') ??
    metaContent($, 'meta[name="twitter:title"]') ??
    asString($("title").first().text());
  const image =
    metaContent($, 'meta[property="og:image"]') ??
    metaContent($, 'meta[name="twitter:image"]');
  const priceRaw =
    metaContent($, 'meta[property="product:price:amount"]') ??
    metaContent($, 'meta[property="og:price:amount"]') ??
    asString($('[itemprop="price"]').first().attr("content"));
  const currency =
    metaContent($, 'meta[property="product:price:currency"]') ??
    metaContent($, 'meta[property="og:price:currency"]') ??
    asString($('[itemprop="priceCurrency"]').first().attr("content"));
  const availability =
    metaContent($, 'meta[property="product:availability"]') ??
    metaContent($, 'meta[property="og:availability"]') ??
    asString($('[itemprop="availability"]').first().attr("href"));

  if (!name && !image && !priceRaw) return null;

  return {
    name,
    price: parsePrice(priceRaw),
    currency,
    image: absoluteUrl(image, base),
    availability: mapAvailability(availability),
    brand: null,
    gtin: null,
  };
}

// ───────────── HTML genérico (best-effort) ─────────────

function extractFromHtml($: cheerio.CheerioAPI, base: string): PartialOffer | null {
  const name = asString($("h1").first().text());

  let priceRaw =
    asString($('[itemprop="price"]').first().attr("content")) ??
    asString($('[itemprop="price"]').first().text());
  if (!priceRaw) {
    const el = $('[class*="price" i]')
      .filter((_, e) => /\d/.test($(e).text()))
      .first();
    priceRaw = el.length ? asString(el.text()) : null;
  }

  const image =
    asString($('[itemprop="image"]').first().attr("content")) ??
    asString($('[itemprop="image"]').first().attr("src"));

  if (!name && !priceRaw) return null;

  return {
    name,
    price: parsePrice(priceRaw),
    currency: null,
    image: absoluteUrl(image, base),
    availability: "UNKNOWN",
    brand: null,
    gtin: null,
  };
}

// ───────────── Merge em camadas ─────────────

function pick<T>(...vals: (T | null | undefined)[]): T | null {
  for (const v of vals) if (v != null && v !== "") return v;
  return null;
}

function resolveSource(
  price: number | null,
  name: string | null,
  layers: { src: ExtractSource; offer: PartialOffer | null }[],
): ExtractSource {
  if (price != null) {
    for (const l of layers) if (l.offer?.price != null) return l.src;
  }
  if (name != null) {
    for (const l of layers) if (l.offer?.name) return l.src;
  }
  return "none";
}

export function extractOffer(html: string, url: string): ExtractedOffer {
  const $ = cheerio.load(html);
  const ld = extractFromJsonLd($, url);
  const og = extractFromMeta($, url);
  const htmlx = extractFromHtml($, url);
  const layers = [
    { src: "json-ld" as const, offer: ld },
    { src: "opengraph" as const, offer: og },
    { src: "html" as const, offer: htmlx },
  ];

  const name = pick(ld?.name, og?.name, htmlx?.name);
  const price = pick(ld?.price, og?.price, htmlx?.price);
  const availability =
    [ld?.availability, og?.availability, htmlx?.availability].find(
      (a) => a && a !== "UNKNOWN",
    ) ?? "UNKNOWN";

  return {
    name,
    price,
    currency: pick(ld?.currency, og?.currency, htmlx?.currency),
    image: pick(ld?.image, og?.image, htmlx?.image),
    availability,
    brand: pick(ld?.brand, og?.brand, htmlx?.brand),
    gtin: pick(ld?.gtin, og?.gtin, htmlx?.gtin),
    source: resolveSource(price, name, layers),
  };
}
