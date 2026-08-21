/**
 * Analisa uma loja candidata antes de cadastrá-la como fonte de ingestão.
 *
 * Roda o mesmo scraper que a ingestão usa, então o resultado prevê o que
 * aconteceria de verdade: se o robots.txt permite, se há sitemap, quantas
 * páginas de produto aparecem e o que o extrator consegue ler de cada uma.
 *
 * Uso:  npx tsx scripts/probe-source.ts https://loja.com.br [amostras]
 *
 * Não escreve nada no banco — é só leitura e relatório.
 */

import { deriveCanonical, inferProductFields } from "@/lib/ingest/create-product";
import { extractOffer } from "@/lib/scrape/extract";
import { fetchPage } from "@/lib/scrape/fetch";
import { isAllowedByRobots } from "@/lib/scrape/robots";
import { SCRAPER_USER_AGENT } from "@/lib/scrape/fetch";
import { discoverUrls } from "@/lib/scrape/sitemap";
import { parseAnyFeed } from "@/lib/scrape/feed";

const RAW_URL = process.argv[2];
const SAMPLES = Number(process.argv[3] ?? 5);

if (!RAW_URL) {
  console.error("uso: npx tsx scripts/probe-source.ts <url> [amostras]");
  process.exit(2);
}

/** Remove parâmetros de rastreamento que atrapalham a leitura da URL base. */
function cleanUrl(raw: string): string {
  const u = new URL(raw);
  for (const p of [...u.searchParams.keys()]) {
    if (/^(srsltid|gclid|fbclid|utm_)/i.test(p)) u.searchParams.delete(p);
  }
  return u.toString();
}

function line(title: string) {
  console.log(`\n=== ${title} ${"=".repeat(Math.max(0, 56 - title.length))}`);
}

async function main() {
  const url = cleanUrl(RAW_URL);
  const origin = new URL(url).origin;

  line("LOJA");
  console.log(`URL informada : ${RAW_URL}`);
  console.log(`URL limpa     : ${url}`);
  console.log(`Origem        : ${origin}`);
  console.log(`User-Agent    : ${SCRAPER_USER_AGENT}`);

  line("ROBOTS.TXT");
  let allowed = false;
  try {
    allowed = await isAllowedByRobots(new URL(url), SCRAPER_USER_AGENT);
    console.log(allowed ? "PERMITE a raiz" : "BLOQUEIA a raiz — a loja não pode ser raspada");
  } catch (e) {
    console.log(`falhou ao ler: ${(e as Error).message}`);
  }
  if (!allowed) {
    console.log("\nVEREDITO: não cadastrar. Respeitar o robots.txt é condição.");
    return;
  }

  line("DESCOBERTA DE URLS (sitemap)");
  let urls: string[] = [];
  for (const candidate of [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
  ]) {
    try {
      const found = await discoverUrls(candidate, {
        limit: 200,
        maxFetches: 25,
        // Mesmo filtro da ingestão: cobre WooCommerce (/produto/) e Tray (/prod-).
        include: /produto|product|prod-/i,
      });
      console.log(`${candidate} -> ${found.length} URL(s) de produto`);
      if (found.length > urls.length) urls = found;
    } catch (e) {
      console.log(`${candidate} -> ${(e as Error).message}`);
    }
  }

  line("FEED (alternativa ao sitemap)");
  for (const candidate of [`${origin}/feed`, `${origin}/rss`, `${origin}/feed.xml`]) {
    try {
      const { html } = await fetchPage(candidate, { accept: "any", maxBytes: 8_000_000 });
      const items = parseAnyFeed(html, candidate);
      console.log(`${candidate} -> ${items.length} item(ns)`);
    } catch (e) {
      console.log(`${candidate} -> ${(e as Error).message}`);
    }
  }

  if (urls.length === 0) {
    console.log("\nVEREDITO: sem sitemap utilizável. Ainda dá para cadastrar como");
    console.log("fonte PAGE (uma URL de produto por vez), mas não em lote.");
    return;
  }

  line(`AMOSTRAGEM (${Math.min(SAMPLES, urls.length)} de ${urls.length})`);
  let ok = 0;
  let comPreco = 0;
  let comImagem = 0;
  let reconhecidos = 0;

  for (const u of urls.slice(0, SAMPLES)) {
    try {
      const { html, finalUrl } = await fetchPage(u);
      const offer = extractOffer(html, finalUrl);
      ok += 1;
      if (offer.price != null && offer.price > 0) comPreco += 1;
      if (offer.image) comImagem += 1;

      const canon = deriveCanonical(offer.name ?? "", offer.brand, null);
      const fields = inferProductFields(offer.name ?? "");
      const entendido = fields.material !== "OUTRO" || fields.kind === "PRINTER";
      if (entendido) reconhecidos += 1;

      console.log(`\n· ${finalUrl}`);
      console.log(`  nome      : ${offer.name ?? "—"}`);
      console.log(`  preço     : ${offer.price ?? "—"}`);
      console.log(`  imagem    : ${offer.image ? "sim" : "—"}`);
      console.log(`  marca     : ${offer.brand ?? "—"}  | gtin: ${offer.gtin ?? "—"}`);
      console.log(`  estoque   : ${offer.availability}`);
      console.log(`  canônico  : ${canon.name} (marca: ${canon.brandName})`);
      console.log(
        `  inferido  : material=${fields.material} tipo=${fields.kind}` +
          ` peso=${fields.netWeightG ?? "—"}g diâmetro=${fields.diameterMm ?? "—"}mm` +
          (entendido ? "" : "  <-- NÃO seria cadastrado"),
      );
    } catch (e) {
      console.log(`\n· ${u}\n  ERRO: ${(e as Error).message}`);
    }
  }

  line("VEREDITO");
  const amostras = Math.min(SAMPLES, urls.length);
  console.log(`páginas lidas       : ${ok}/${amostras}`);
  console.log(`com preço           : ${comPreco}/${amostras}`);
  console.log(`com imagem          : ${comImagem}/${amostras}`);
  console.log(`material reconhecido: ${reconhecidos}/${amostras}`);
  console.log(`produtos no sitemap : ${urls.length}`);
  if (ok === 0) {
    console.log("\nNão dá para ler as páginas — investigar antes de cadastrar.");
  } else if (comPreco === 0) {
    console.log("\nLê as páginas mas não acha preço: o extrator precisa de ajuste.");
  } else {
    console.log("\nPronta para cadastrar como fonte SITEMAP.");
  }
}

main().catch((e) => {
  console.error(`falhou: ${(e as Error).message}`);
  process.exit(1);
});
