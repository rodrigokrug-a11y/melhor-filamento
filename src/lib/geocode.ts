// Geocoding via Nominatim (OpenStreetMap) — uso polido, com User-Agent próprio.
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA = "MelhorFilamentoBot/1.0 (+https://melhorfilamento.com.br/bot)";

/** Converte um texto (ex.: "São Paulo, SP, Brasil") em coordenadas. */
export async function geocode(
  query: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(
    query,
  )}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "pt-BR" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  const first =
    Array.isArray(data) && data.length
      ? (data[0] as { lat?: string; lon?: string })
      : null;
  if (!first?.lat || !first?.lon) return null;

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}
