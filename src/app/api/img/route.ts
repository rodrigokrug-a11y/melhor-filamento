import { type NextRequest } from "next/server";

// Proxy de imagem: busca a imagem da loja no servidor (sem Referer) e serve do
// nosso domínio. Resolve hotlink protection (ex.: 3D Fila bloqueia Referer
// externo). Usado como fallback quando a imagem direta falha.
export const runtime = "nodejs";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/** Bloqueia hosts privados/loopback/link-local (proteção SSRF). */
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  // IPv6 loopback/ULA/link-local + IPv4-mapado (::ffff:127.0.0.1 etc.)
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) {
    return true;
  }
  if (h.includes("::ffff:") || h.includes("::127.")) return true;
  // Só dígitos / hex = provável IP decimal/hex (ex.: 2130706433) — bloqueia.
  if (/^\d+$/.test(h) || /^0x[0-9a-f]+$/.test(h)) return true;
  return false;
}

/** Fetch seguindo redirects manualmente, revalidando o host a cada hop
 *  (impede bypass do bloqueio de SSRF via redirect para a rede interna). */
async function fetchImageSafely(start: URL): Promise<Response | null> {
  let url = start;
  for (let hop = 0; hop < 4; hop++) {
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (isBlockedHost(url.hostname)) return null;
    const res = await fetch(url.toString(), {
      // Sem Referer de propósito — contorna hotlink protection.
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/avif,image/webp,image/*,*/*",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(12000),
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return null;
      url = new URL(loc, url); // resolve relativo + revalida no próximo laço
      continue;
    }
    return res;
  }
  return null; // redirects demais
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new Response("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new Response("bad protocol", { status: 400 });
  }
  if (isBlockedHost(target.hostname)) {
    return new Response("blocked host", { status: 400 });
  }

  try {
    const upstream = await fetchImageSafely(target);
    const ct = (upstream?.headers.get("content-type") ?? "").split(";")[0].trim();
    // Allowlist de rasters — bloqueia image/svg+xml (pode conter <script> e
    // executar JS na NOSSA origem) e qualquer content-type não-imagem.
    if (!upstream || !upstream.ok || !/^image\/(png|jpe?g|webp|gif|avif)$/i.test(ct)) {
      return new Response("not an image", { status: 404 });
    }
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 404 });
  }
}
