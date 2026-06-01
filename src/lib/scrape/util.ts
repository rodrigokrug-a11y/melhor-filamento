import type { Availability } from "@/lib/scrape/types";

export function absoluteUrl(
  src: string | null | undefined,
  base: string,
): string | null {
  if (!src) return null;
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

export function mapAvailability(raw: unknown): Availability {
  const v = typeof raw === "string" ? raw.toLowerCase() : "";
  if (!v) return "UNKNOWN";
  if (
    v.includes("outofstock") ||
    v.includes("out of stock") ||
    v.includes("out_of_stock") ||
    v.includes("soldout") ||
    v.includes("sold out") ||
    v.includes("discontinued") ||
    v.includes("indispon")
  ) {
    return "OUT_OF_STOCK";
  }
  if (
    v.includes("instock") ||
    v.includes("in stock") ||
    v.includes("in_stock") ||
    v.includes("dispon") ||
    v.includes("preorder") ||
    v === "available"
  ) {
    return "IN_STOCK";
  }
  return "UNKNOWN";
}
