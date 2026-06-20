import { lookup } from "node:dns/promises";

// Proteção SSRF: valida que uma URL aponta para um host PÚBLICO antes de o
// servidor buscá-la. Cobre IP literal (v4/v6, mapeado, decimal/hex) e, via
// resolução de DNS, domínios que apontam para a rede interna.

function isPrivateIpv4(ip: string): boolean {
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const o = m.slice(1).map(Number);
  if (o.some((n) => n > 255)) return true; // octeto inválido → bloqueia
  const [a, b] = o;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / metadata
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast/reservado
  return false;
}

export function isPrivateIp(ip: string): boolean {
  const s = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (s === "::1" || s === "::") return true;
  if (s.startsWith("fc") || s.startsWith("fd") || s.startsWith("fe80")) return true;
  if (s.startsWith("::ffff:")) return isPrivateIpv4(s.slice(7));
  if (s.includes(":")) return false; // demais IPv6 públicos permitidos
  return isPrivateIpv4(s);
}

export function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (!h) return true;
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".internal") ||
    h.endsWith(".local")
  ) {
    return true;
  }
  // Formas decimais/hex de IP (ex.: 2130706433, 0x7f000001).
  if (/^\d+$/.test(h) || /^0x[0-9a-f]+$/.test(h)) return true;
  return isPrivateIp(h);
}

/** Lança se a URL não for http(s) público (host bloqueado ou DNS → IP interno). */
export async function assertPublicUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Protocolo não permitido.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isBlockedHostname(host)) throw new Error("Host bloqueado.");
  try {
    const addrs = await lookup(host, { all: true });
    for (const a of addrs) {
      if (isPrivateIp(a.address)) throw new Error("Host resolve para rede interna.");
    }
  } catch (e) {
    // Erro nosso (host interno) propaga; falha de DNS deixa o fetch falhar depois.
    if (e instanceof Error && /interna|bloqueado|permitido/.test(e.message)) throw e;
  }
}
