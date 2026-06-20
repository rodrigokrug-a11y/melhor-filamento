"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { geocode } from "@/lib/geocode";
import { lookupCep } from "@/lib/viacep";

export async function toggleSellerVerified(formData: FormData): Promise<void> {
  await requireAdmin();
  const sellerId = String(formData.get("sellerId") ?? "");
  const verified = formData.get("verified") === "true";
  if (!sellerId) return;
  await prisma.seller.update({
    where: { id: sellerId },
    data: { isVerified: verified },
  });
  revalidatePath("/admin/lojas");
}

type GeocodeResult = {
  error?: string;
  city?: string;
  uf?: string;
  latitude?: number;
  longitude?: number;
};

/** Busca cidade/UF (ViaCEP) + coordenadas (Nominatim) a partir de um CEP. */
export async function geocodeCep(cep: string): Promise<GeocodeResult> {
  await requireAdmin();
  let via;
  try {
    via = await lookupCep(cep);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "CEP inválido." };
  }
  const coords = await geocode(`${via.localidade}, ${via.uf}, Brasil`);
  return {
    city: via.localidade,
    uf: via.uf,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  };
}

type LocationState = { error?: string; ok?: boolean };

const LocationSchema = z.object({
  sellerId: z.string().min(1),
  city: z.string().trim().optional().default(""),
  uf: z.string().trim().max(2).optional().default(""),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

/** Salva a localização e a opção de retirada de uma loja. */
export async function updateSellerLocation(
  _prev: LocationState,
  formData: FormData,
): Promise<LocationState> {
  await requireAdmin();
  const parsed = LocationSchema.safeParse({
    sellerId: formData.get("sellerId"),
    city: formData.get("city") ?? "",
    uf: formData.get("uf") ?? "",
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
  });
  if (!parsed.success) return { error: "Dados inválidos." };
  const d = parsed.data;
  const pickup = formData.get("offersPickup") === "on";

  await prisma.seller.update({
    where: { id: d.sellerId },
    data: {
      city: d.city || null,
      uf: d.uf ? d.uf.toUpperCase() : null,
      latitude:
        d.latitude != null && Number.isFinite(d.latitude) ? d.latitude : null,
      longitude:
        d.longitude != null && Number.isFinite(d.longitude)
          ? d.longitude
          : null,
      offersPickup: pickup,
    },
  });
  revalidatePath("/admin/lojas");
  revalidatePath("/perto");
  return { ok: true };
}

/** Libera o autoatendimento: vincula um usuário (por e-mail) como dono da loja,
 *  criando o usuário se não existir. Ele passa a gerenciar os anúncios em /painel. */
export async function grantSellerAccess(formData: FormData): Promise<void> {
  await requireAdmin();
  const sellerId = String(formData.get("sellerId") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!sellerId || !email.includes("@")) return;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, role: "LOJA" } });
  }
  // Um usuário é dono de no máximo uma loja (ownerUserId é único).
  const owned = await prisma.seller.findUnique({
    where: { ownerUserId: user.id },
  });
  if (owned && owned.id !== sellerId) return;

  await prisma.seller.update({
    where: { id: sellerId },
    data: { ownerUserId: user.id },
  });
  revalidatePath(`/admin/lojas/${sellerId}`);
}

/** Remove o acesso de autoatendimento da loja. */
export async function revokeSellerAccess(formData: FormData): Promise<void> {
  await requireAdmin();
  const sellerId = String(formData.get("sellerId") ?? "");
  if (!sellerId) return;
  await prisma.seller.update({
    where: { id: sellerId },
    data: { ownerUserId: null },
  });
  revalidatePath(`/admin/lojas/${sellerId}`);
}
