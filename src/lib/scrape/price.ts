/**
 * Converte um preço cru (texto BR/US ou número) em number.
 * Lida com "R$ 1.234,56", "1.234,56", "1,234.56", "199.90", "199,90".
 * Retorna null quando não dá pra interpretar.
 */
export function parsePrice(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

  let s = String(raw)
    .trim()
    .replace(/[^\d.,-]/g, "");
  if (!s || s === "-" || s === "." || s === ",") return null;

  const hasDot = s.includes(".");
  const hasComma = s.includes(",");

  if (hasDot && hasComma) {
    // O último separador é o decimal.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    const decimals = s.length - s.lastIndexOf(",") - 1;
    s = decimals === 1 || decimals === 2 ? s.replace(",", ".") : s.replace(/,/g, "");
  } else if (hasDot) {
    const parts = s.split(".");
    // "1.234.567" (milhar) ou "1.234" (milhar com 3 casas) → remove os pontos.
    if (parts.length > 2 || (parts[1]?.length ?? 0) === 3) {
      s = s.replace(/\./g, "");
    }
  }

  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
