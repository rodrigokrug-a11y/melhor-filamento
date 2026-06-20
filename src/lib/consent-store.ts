// Store externo para o consentimento de cookies, lido do cookie no cliente.
// Usado via useSyncExternalStore — seguro para hidratação (o servidor assume
// "consentido" e não renderiza o banner; o cliente sincroniza com o cookie).

export const CONSENT_COOKIE = "mf_consent";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue = false;
let hasCache = false;

function rawCookie(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return entry ? entry.slice(CONSENT_COOKIE.length + 1) : null;
}

export function getConsentSnapshot(): boolean {
  const raw = rawCookie();
  if (!hasCache || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = raw === "1";
    hasCache = true;
  }
  return cachedValue;
}

// No servidor assumimos consentido para não renderizar o banner no SSR
// (evita flash e divergência de hidratação).
export function getConsentServerSnapshot(): boolean {
  return true;
}

export function subscribeConsent(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function acceptConsent(): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 180; // 180 dias
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax${secure}`;
  hasCache = false;
  for (const listener of listeners) listener();
}
