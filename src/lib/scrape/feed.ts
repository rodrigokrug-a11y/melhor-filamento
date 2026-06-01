import * as cheerio from "cheerio";

import { parsePrice } from "@/lib/scrape/price";
import type { Availability } from "@/lib/scrape/types";
import { absoluteUrl, mapAvailability } from "@/lib/scrape/util";

export type FeedItem = {
  name: string | null;
  price: number | null;
  currency: string | null;
  image: string | null;
  availability: Availability;
  brand: string | null;
  gtin: string | null;
  url: string | null;
};

function priceAndCurrency(raw: string | undefined): {
  price: number | null;
  currency: string | null;
} {
  if (!raw) return { price: null, currency: null };
  const currency = raw.match(/[A-Z]{3}/)?.[0] ?? null;
  return { price: parsePrice(raw), currency };
}

// ───────────── Feed XML (RSS / Google Merchant / Atom) ─────────────

export function parseFeed(xml: string, baseUrl: string): FeedItem[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: FeedItem[] = [];

  $("item, entry").each((_, node) => {
    const map: Record<string, string> = {};
    let linkHref: string | null = null;
    let mediaUrl: string | null = null;

    $(node)
      .children()
      .each((__, child) => {
        if (child.type !== "tag") return;
        const tag = child.name.toLowerCase();
        const text = $(child).text().trim();
        if (text && !(tag in map)) map[tag] = text;
        if ((tag === "link" || tag === "atom:link") && !linkHref) {
          linkHref = child.attribs.href ?? null;
        }
        if ((tag === "enclosure" || tag === "media:content") && !mediaUrl) {
          mediaUrl = child.attribs.url ?? null;
        }
      });

    const get = (...keys: string[]): string | undefined => {
      for (const k of keys) if (map[k]) return map[k];
      return undefined;
    };

    const name = get("g:title", "title") ?? null;
    const { price, currency } = priceAndCurrency(
      get("g:price", "g:sale_price", "price"),
    );
    if (!name && price == null) return;

    const link = get("g:link", "link") ?? linkHref;
    const image = get("g:image_link", "g:image", "image") ?? mediaUrl;

    items.push({
      name,
      price,
      currency,
      image: absoluteUrl(image, baseUrl),
      availability: mapAvailability(get("g:availability", "availability")),
      brand: get("g:brand", "brand") ?? null,
      gtin: get("g:gtin", "g:gtin13", "gtin", "g:mpn") ?? null,
      url: absoluteUrl(link, baseUrl),
    });
  });

  return items;
}

// ───────────── Datafeed CSV (comum em redes de afiliados) ─────────────

function detectDelimiter(headerLine: string): string {
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  for (const ch of headerLine) if (ch in counts) counts[ch] += 1;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ",";
}

function parseCsvRows(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function findCol(header: string[], names: string[]): number {
  for (let i = 0; i < header.length; i += 1) {
    if (names.includes(header[i])) return i;
  }
  for (let i = 0; i < header.length; i += 1) {
    if (names.some((n) => header[i].includes(n))) return i;
  }
  return -1;
}

export function parseCsvFeed(text: string, baseUrl: string): FeedItem[] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const rows = parseCsvRows(text, detectDelimiter(firstLine));
  if (rows.length < 2) return [];

  const header = rows[0].map((h) =>
    h.trim().toLowerCase().replace(/^["']|["']$/g, ""),
  );
  const col = {
    name: findCol(header, ["title", "name", "nome", "produto"]),
    price: findCol(header, ["sale_price", "price", "preco", "preço", "g:price"]),
    image: findCol(header, ["image_link", "image", "imagem", "foto"]),
    url: findCol(header, ["link", "url"]),
    gtin: findCol(header, ["gtin", "ean", "barcode", "codigo"]),
    brand: findCol(header, ["brand", "marca"]),
    availability: findCol(header, ["availability", "disponibilidade", "estoque"]),
  };

  const items: FeedItem[] = [];
  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r];
    const at = (i: number) => (i >= 0 && i < row.length ? row[i].trim() : "");

    const name = col.name >= 0 ? at(col.name) || null : null;
    const { price, currency } = priceAndCurrency(
      col.price >= 0 ? at(col.price) : undefined,
    );
    if (!name && price == null) continue;

    items.push({
      name,
      price,
      currency,
      image: absoluteUrl(col.image >= 0 ? at(col.image) : null, baseUrl),
      availability: mapAvailability(
        col.availability >= 0 ? at(col.availability) : null,
      ),
      brand: col.brand >= 0 ? at(col.brand) || null : null,
      gtin: col.gtin >= 0 ? at(col.gtin) || null : null,
      url: absoluteUrl(col.url >= 0 ? at(col.url) : null, baseUrl),
    });
  }
  return items;
}

/** Detecta XML vs CSV e delega para o parser adequado. */
export function parseAnyFeed(text: string, baseUrl: string): FeedItem[] {
  return text.trimStart().startsWith("<")
    ? parseFeed(text, baseUrl)
    : parseCsvFeed(text, baseUrl);
}
