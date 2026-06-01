import { type Region, deriveRegion } from "@/lib/shipping";

export const REGION_COOKIE = "mf_region";

export type RegionData = {
  uf: string;
  region: Region;
  cep: string | null;
  localidade: string | null;
};

export function serializeRegion(data: RegionData): string {
  return encodeURIComponent(JSON.stringify(data));
}

export function parseRegion(raw: string | undefined | null): RegionData | null {
  if (!raw) return null;
  try {
    const obj: unknown = JSON.parse(decodeURIComponent(raw));
    if (
      typeof obj !== "object" ||
      obj === null ||
      typeof (obj as { uf?: unknown }).uf !== "string"
    ) {
      return null;
    }
    const record = obj as Record<string, unknown>;
    const uf = (record.uf as string).toUpperCase();
    const region = deriveRegion(uf);
    if (!region) return null;
    return {
      uf,
      region,
      cep: typeof record.cep === "string" ? record.cep : null,
      localidade:
        typeof record.localidade === "string" ? record.localidade : null,
    };
  } catch {
    return null;
  }
}

export function readRegionCookie(): RegionData | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${REGION_COOKIE}=`));
  return parseRegion(entry?.slice(REGION_COOKIE.length + 1));
}

export function writeRegionCookie(data: RegionData): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 90; // 90 dias
  document.cookie = `${REGION_COOKIE}=${serializeRegion(data)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearRegionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REGION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
