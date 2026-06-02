import { type NextRequest } from "next/server";

// Proxy de imagem: busca a imagem da loja no servidor (sem Referer) e serve do
// nosso domínio. Resolve hotlink protection (ex.: 3D Fila bloqueia Referer
// externo). Usado como fallback quando a imagem direta falha.
export const runtime = "nodejs";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/** Bloqueia hosts privados/loopback/link-local (proteção SSRF). */
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) {
    return true;
  }
  return false;
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
    const upstream = await fetch(target.toString(), {
      // Sem Referer de propósito — contorna hotlink protection.
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/avif,image/webp,image/*,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    const ct = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !ct.startsWith("image/")) {
      return new Response("not an image", { status: 404 });
    }
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 404 });
  }
}
