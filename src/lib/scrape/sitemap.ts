import * as cheerio from "cheerio";

import { fetchPage } from "@/lib/scrape/fetch";

export type SitemapParse = { kind: "index" | "urlset"; urls: string[] };

/** Lê um sitemap: distingue índice (lista de sitemaps) de urlset (lista de páginas). */
export function parseSitemap(xml: string): SitemapParse {
  const $ = cheerio.load(xml, { xmlMode: true });

  const sitemapLocs: string[] = [];
  $("sitemap > loc").each((_, el) => {
    const t = $(el).text().trim();
    if (t) sitemapLocs.push(t);
  });
  if (sitemapLocs.length > 0) return { kind: "index", urls: sitemapLocs };

  const urlLocs: string[] = [];
  $("url > loc").each((_, el) => {
    const t = $(el).text().trim();
    if (t) urlLocs.push(t);
  });
  return { kind: "urlset", urls: urlLocs };
}

/**
 * Descobre URLs a partir de um sitemap (recursivo em índices), com filtro
 * opcional e limites — para não varrer o site inteiro de uma vez.
 */
export async function discoverUrls(
  rootUrl: string,
  opts: { limit?: number; include?: RegExp; maxFetches?: number } = {},
): Promise<string[]> {
  const limit = opts.limit ?? 100;
  const maxFetches = opts.maxFetches ?? 25;
  const found: string[] = [];
  const queue: string[] = [rootUrl];
  const seen = new Set<string>();
  let fetches = 0;

  while (queue.length > 0 && found.length < limit && fetches < maxFetches) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    let xml: string;
    try {
      ({ html: xml } = await fetchPage(url, {
        accept: "any",
        maxBytes: 10_000_000,
      }));
      fetches += 1;
    } catch {
      continue;
    }

    const parsed = parseSitemap(xml);
    if (parsed.kind === "index") {
      // Prioriza sitemaps de produto (onde estão os anúncios) antes de page/blog.
      const ordered = [...parsed.urls].sort(
        (a, b) =>
          (/produto|product/i.test(a) ? 0 : 1) -
          (/produto|product/i.test(b) ? 0 : 1),
      );
      for (const sm of ordered) if (!seen.has(sm)) queue.push(sm);
    } else {
      for (const u of parsed.urls) {
        if (opts.include && !opts.include.test(u)) continue;
        if (!found.includes(u)) found.push(u);
        if (found.length >= limit) break;
      }
    }
  }

  return found.slice(0, limit);
}
