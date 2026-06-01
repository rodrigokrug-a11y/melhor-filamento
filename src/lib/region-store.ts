// Store externo para a região escolhida, lida do cookie no cliente.
// Usado via useSyncExternalStore — seguro para hidratação (servidor e primeiro
// render do cliente veem null; depois sincroniza com o cookie).
import {
  REGION_COOKIE,
  type RegionData,
  clearRegionCookie,
  parseRegion,
  writeRegionCookie,
} from "@/lib/region";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: RegionData | null = null;
let hasCache = false;

function rawCookie(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${REGION_COOKIE}=`));
  return entry ? entry.slice(REGION_COOKIE.length + 1) : null;
}

export function getSnapshot(): RegionData | null {
  const raw = rawCookie();
  if (!hasCache || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseRegion(raw);
    hasCache = true;
  }
  return cachedValue;
}

export function getServerSnapshot(): RegionData | null {
  return null;
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function emit(): void {
  hasCache = false;
  for (const listener of listeners) listener();
}

export function setRegionData(data: RegionData): void {
  writeRegionCookie(data);
  emit();
}

export function clearRegionData(): void {
  clearRegionCookie();
  emit();
}
