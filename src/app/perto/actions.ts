"use server";

import { geocode } from "@/lib/geocode";
import { lookupCep } from "@/lib/viacep";

/**
 * Converte o CEP do visitante em coordenadas (nível cidade) para o "perto de
 * você", sem precisar de permissão de GPS.
 */
export async function geocodeUserCep(
  cep: string,
): Promise<{ latitude: number; longitude: number } | null> {
  let via;
  try {
    via = await lookupCep(cep);
  } catch {
    return null;
  }
  return geocode(`${via.localidade}, ${via.uf}, Brasil`);
}
