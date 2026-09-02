/**
 * Analisa uma loja candidata antes de cadastrá-la como fonte de ingestão.
 *
 * Roda o mesmo scraper que a ingestão usa, então o resultado prevê o que
 * aconteceria de verdade — mas com um nível de detalhe que a ingestão não
 * expõe, para distinguir os motivos de uma loja "não dar certo":
 *
 *   - o robots.txt bloqueia?
 *   - não existe sitemap, ou existe e as URLs não batem com o filtro?
 *   - as páginas abrem mas o extrator não acha preço?
 *   - o preço é lido mas o material não é reconhecido (produto descartado)?
 *
 * Uso:  npx tsx scripts/probe-source.ts https://loja.com.br [amostras]
 *
 * Não escreve nada no banco — é só leitura e relatório.
 */

import { deriveCanonical, inferProductFields } from "@/lib/ingest/create-product";
import { matchesUrlFilter, parseUrlFilter } from "@/lib/ingest/url-filter";
import { extractOffer } from "@/lib/scrape/extract";
import { SCRAPER_USER_AGENT, fetchPage } from "@/lib/scrape/fetch";
import { isAllowedByRobots } from "@/lib/scrape/robots";
import { parseSitemap } from "@/lib/scrape/sitemap";

/** Mesmo filtro que a ingestão aplica ao varrer um sitemap. */
const RAW_URL = process.argv[2];
const SAMPLES = Number(process.argv[3] ?? 5);
// Terceiro argumento: os mesmos trechos que o cadastro da fonte aceita. Serve
// para TESTAR um filtro antes de salvá-lo — a pergunta "esse filtro pega os
// produtos desta loja?" tem resposta aqui, sem tocar no banco.
const FILTER_RAW = process.argv[4] ?? "";
const FILTER = parseUrlFilter(FILTER_RAW);
const matchesFilter = (u: string) => matchesUrlFilter(u, FILTER);

if (!RAW_URL) {
  console.error(
    "uso: npx tsx scripts/probe-source.ts <url> [amostras] [trechos-da-url]",
  );
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

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Sitemaps declarados no robots.txt — a forma canônica de encontrá-los. */
async function sitemapsFromRobots(origin: string): Promise<string[]> {
  try {
    const { html } = await fetchPage(`${origin}/robots.txt`, {
      accept: "any",
      maxBytes: 512_000,
    });
    const out: string[] = [];
    for (const l of html.split(/\r?\n/)) {
      const m = /^\s*sitemap\s*:\s*(\S+)/i.exec(l);
      if (m) out.push(m[1]);
    }
    return out;
  } catch {
    return [];
  }
}

type Node = { url: string; kind: string; count: number; error?: string };

/** Lê um sitemap e, se for índice, desce um nível. Devolve as URLs de página. */
async function walkSitemap(
  url: string,
  visited: Set<string>,
  report: Node[],
  depth = 0,
): Promise<string[]> {
  if (visited.has(url) || visited.size > 40) return [];
  visited.add(url);

  let xml: string;
  try {
    ({ html: xml } = await fetchPage(url, { accept: "any", maxBytes: 10_000_000 }));
  } catch (e) {
    report.push({ url, kind: "—", count: 0, error: msg(e) });
    return [];
  }

  const parsed = parseSitemap(xml);
  report.push({ url, kind: parsed.kind, count: parsed.urls.length });

  if (parsed.kind === "urlset") return parsed.urls;
  if (depth >= 2) return [];

  const all: string[] = [];
  // Índices grandes: desce só nos primeiros, o bastante para ver o padrão.
  for (const child of parsed.urls.slice(0, 8)) {
    all.push(...(await walkSitemap(child, visited, report, depth + 1)));
  }
  return all;
}

/** Segmento inicial de caminho mais comum — revela o padrão de URL da loja. */
function pathHistogram(urls: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const u of urls) {
    try {
      const seg = new URL(u).pathname.split("/").filter(Boolean)[0] ?? "(raiz)";
      counts.set(seg, (counts.get(seg) ?? 0) + 1);
    } catch {
      // ignora URL malformada
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

async function main() {
  const url = cleanUrl(RAW_URL);
  const origin = new URL(url).origin;

  line("LOJA");
  console.log(`URL informada : ${RAW_URL}`);
  console.log(`URL limpa     : ${url}`);
  console.log(`User-Agent    : ${SCRAPER_USER_AGENT}`);

  line("ROBOTS.TXT");
  let allowed = false;
  try {
    allowed = await isAllowedByRobots(new URL(url), SCRAPER_USER_AGENT);
    console.log(allowed ? "PERMITE a raiz" : "BLOQUEIA a raiz");
  } catch (e) {
    console.log(`falhou ao ler: ${msg(e)}`);
  }
  if (!allowed) {
    console.log("\nVEREDITO: não cadastrar. Respeitar o robots.txt é condição.");
    return;
  }

  const declared = await sitemapsFromRobots(origin);
  console.log(
    declared.length
      ? `Sitemaps declarados: ${declared.join(", ")}`
      : "Nenhum sitemap declarado no robots.txt",
  );

  line("SITEMAPS");
  const candidates = [
    ...declared,
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
    `${origin}/wp-sitemap.xml`,
    `${origin}/sitemap/sitemap-index.xml`,
  ];

  const visited = new Set<string>();
  const report: Node[] = [];
  const pageUrls: string[] = [];
  for (const c of candidates) {
    pageUrls.push(...(await walkSitemap(c, visited, report)));
  }

  for (const n of report) {
    console.log(
      `${n.error ? "✗" : "✓"} ${n.url}\n    ${
        n.error ? n.error : `${n.kind} · ${n.count} entrada(s)`
      }`,
    );
  }

  const unique = [...new Set(pageUrls)];
  console.log(`\nTotal de URLs de página encontradas: ${unique.length}`);

  if (unique.length === 0) {
    console.log("\nVEREDITO: nenhum sitemap utilizável.");
    console.log("Cadastrar como fonte PAGE (uma URL de produto por vez), ou");
    console.log("investigar se a loja publica catálogo em outro formato.");
    return;
  }

  // A distinção que importa: existe sitemap, mas as URLs batem com o filtro?
  const matching = unique.filter(matchesFilter);
  const origem = FILTER_RAW.trim() ? "informado" : "padrão";
  console.log(
    `Que batem com o filtro ${origem} (${FILTER.join(", ")}): ${matching.length}`,
  );

  console.log("\nSegmentos de caminho mais comuns:");
  for (const [seg, n] of pathHistogram(unique)) console.log(`  /${seg}  (${n})`);

  console.log("\nAmostra de URLs:");
  for (const u of unique.slice(0, 5)) console.log(`  ${u}`);

  if (matching.length === 0) {
    console.log("\nATENÇÃO: há sitemap, mas NENHUMA URL bate com o filtro da");
    console.log("ingestão. A loja seria cadastrada e traria zero ofertas — que");
    console.log("é como uma fonte morta se disfarça de 'ok'. Escolha um trecho");
    console.log("dos caminhos acima e passe no 3º argumento para testar:");
    console.log(`  npx tsx scripts/probe-source.ts "${RAW_URL}" 5 "/loja/"`);
    console.log("O mesmo texto vai no campo da fonte, no admin.");
  }

  // Amostra as que batem; se nenhuma bater, amostra assim mesmo para
  // descobrir se são páginas de produto sob outro padrão de URL.
  const pool = matching.length > 0 ? matching : unique;
  const amostras = Math.min(SAMPLES, pool.length);

  line(`AMOSTRAGEM (${amostras} de ${pool.length})`);
  let ok = 0;
  let comPreco = 0;
  let comImagem = 0;
  let reconhecidos = 0;

  for (const u of pool.slice(0, amostras)) {
    try {
      const { html, finalUrl } = await fetchPage(u);
      const offer = extractOffer(html, finalUrl);
      ok += 1;
      if (offer.price != null && offer.price > 0) comPreco += 1;
      if (offer.image) comImagem += 1;

      const canon = deriveCanonical(offer.name ?? "", offer.brand, null);
      const fields = inferProductFields(offer.name ?? "");
      // Espelha a regra da ingestão: material desconhecido e não-impressora
      // é descartado, mesmo com preço lido.
      const entraNoCatalogo = fields.material !== "OUTRO" || fields.kind === "PRINTER";
      if (entraNoCatalogo) reconhecidos += 1;

      console.log(`\n· ${finalUrl}`);
      console.log(`  nome     : ${offer.name ?? "—"}`);
      console.log(`  preço    : ${offer.price ?? "—"}   estoque: ${offer.availability}`);
      console.log(`  imagem   : ${offer.image ? "sim" : "—"}   marca: ${offer.brand ?? "—"}   gtin: ${offer.gtin ?? "—"}`);
      console.log(`  canônico : ${canon.name} (marca: ${canon.brandName})`);
      console.log(
        `  inferido : material=${fields.material} tipo=${fields.kind}` +
          ` peso=${fields.netWeightG ?? "—"}g diâmetro=${fields.diameterMm ?? "—"}mm` +
          (entraNoCatalogo ? "" : "   <-- SERIA DESCARTADO"),
      );
    } catch (e) {
      console.log(`\n· ${u}\n  ERRO: ${msg(e)}`);
    }
  }

  line("VEREDITO");
  console.log(`páginas abertas      : ${ok}/${amostras}`);
  console.log(`com preço            : ${comPreco}/${amostras}`);
  console.log(`com imagem           : ${comImagem}/${amostras}`);
  console.log(`entrariam no catálogo: ${reconhecidos}/${amostras}`);
  console.log(`URLs no sitemap      : ${unique.length} (${matching.length} no filtro atual)`);

  if (ok === 0) console.log("\nNão dá para ler as páginas — investigar antes de cadastrar.");
  else if (comPreco === 0) console.log("\nLê as páginas mas não acha preço: o extrator precisa de ajuste.");
  else if (matching.length === 0) console.log("\nPrecisa ajustar o filtro de URL antes de cadastrar.");
  else if (reconhecidos < amostras) console.log("\nCadastrável, mas parte do catálogo seria descartada por material não reconhecido.");
  else console.log("\nPronta para cadastrar como fonte SITEMAP.");
}

main().catch((e) => {
  console.error(`falhou: ${msg(e)}`);
  process.exit(1);
});
