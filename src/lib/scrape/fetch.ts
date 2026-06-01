import { isAllowedByRobots } from "@/lib/scrape/robots";

export const SCRAPER_USER_AGENT =
  "MelhorFilamentoBot/1.0 (+https://melhorfilamento.com.br/bot)";

type Accept = "html" | "any";
type FetchOptions = { timeoutMs?: number; maxBytes?: number; accept?: Accept };

const ACCEPT_HEADER: Record<Accept, string> = {
  html: "text/html,application/xhtml+xml",
  any: "text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.9,*/*;q=0.8",
};

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.length;
      if (total > maxBytes) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function contentTypeOk(contentType: string, accept: Accept): boolean {
  if (accept === "html") return /text\/html|application\/xhtml/i.test(contentType);
  // "any": aceita texto/xml/json; rejeita apenas binários óbvios.
  return !/^(image|audio|video|font)\//i.test(contentType);
}

/**
 * Busca uma página/recurso de forma educada: respeita robots.txt, identifica-se
 * com um User-Agent próprio, aplica timeout e limite de tamanho.
 * `accept: "html"` (padrão) exige HTML; `"any"` aceita XML/feeds/sitemaps.
 */
export async function fetchPage(
  url: string,
  opts: FetchOptions = {},
): Promise<{ html: string; finalUrl: string }> {
  const accept = opts.accept ?? "html";
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    throw new Error("URL inválida.");
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("Use uma URL http(s).");
  }

  if (!(await isAllowedByRobots(target, SCRAPER_USER_AGENT))) {
    throw new Error("Acesso bloqueado pelo robots.txt do site.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12000);
  let res: Response;
  try {
    res = await fetch(target, {
      headers: {
        "user-agent": SCRAPER_USER_AGENT,
        accept: ACCEPT_HEADER[accept],
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } catch {
    throw new Error("Não foi possível acessar a página.");
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`A página respondeu HTTP ${res.status}.`);
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentTypeOk(contentType, accept)) {
    throw new Error("A URL não retornou conteúdo de texto.");
  }

  const html = await readCapped(res, opts.maxBytes ?? 2_000_000);
  return { html, finalUrl: res.url };
}
