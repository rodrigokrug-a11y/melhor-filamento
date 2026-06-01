import { extractOffer } from "@/lib/scrape/extract";
import { fetchPage } from "@/lib/scrape/fetch";
import type { ExtractedOffer } from "@/lib/scrape/types";

export type { ExtractedOffer, Availability } from "@/lib/scrape/types";
export { extractOffer } from "@/lib/scrape/extract";
export { fetchPage, SCRAPER_USER_AGENT } from "@/lib/scrape/fetch";
export { isPathAllowed } from "@/lib/scrape/robots";

/** Busca a página e extrai a oferta (JSON-LD → OpenGraph → HTML). */
export async function scrapeOffer(url: string): Promise<ExtractedOffer> {
  const { html, finalUrl } = await fetchPage(url);
  return extractOffer(html, finalUrl);
}
