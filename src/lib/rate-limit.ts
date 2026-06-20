// Rate-limit simples em memória do processo (a app roda em 1 container Docker).
// Janela deslizante por chave. Não substitui um Redis num cenário multi-instância,
// mas barra abuso/spam/bots — essencial com tráfego pago.

const buckets = new Map<string, number[]>();

/** Retorna `true` se a chave ESTOUROU o limite (deve ser bloqueada). */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    buckets.set(key, arr);
    return true;
  }
  arr.push(now);
  buckets.set(key, arr);
  // Limpeza ocasional pra não vazar memória.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return false;
}

/** IP do cliente a partir dos headers do proxy (nginx).
 *  Prefere X-Real-IP (nginx seta = $remote_addr). No X-Forwarded-For, usa a
 *  ÚLTIMA entrada (a adicionada pelo nosso proxy) — a PRIMEIRA é falsificável
 *  pelo cliente, então não serve como chave de rate-limit. */
export function clientIp(req: Request): string {
  const h = req.headers;
  const xri = h.get("x-real-ip")?.trim();
  if (xri) return xri;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

/** Resposta padrão 429. */
export function tooMany(): Response {
  return new Response(
    JSON.stringify({ error: "Muitas requisições. Tente de novo em instantes." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } },
  );
}
