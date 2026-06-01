// Reverse geocoding por coordenadas → UF (BigDataCloud, endpoint sem chave).
// Usado como fallback quando o usuário opta por "usar minha localização".
export async function ufFromCoords(
  latitude: number,
  longitude: number,
): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Não foi possível obter sua localização.");
  }
  if (!res.ok) throw new Error("Não foi possível obter sua localização.");

  const data: unknown = await res.json();
  const code = (data as { principalSubdivisionCode?: unknown })
    .principalSubdivisionCode;
  if (typeof code === "string" && code.startsWith("BR-")) {
    return code.slice(3).toUpperCase();
  }
  throw new Error("Localização fora do Brasil ou indisponível.");
}
