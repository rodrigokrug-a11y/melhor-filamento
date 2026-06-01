"use server";

import { type OfferStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

/** Edição em massa: muda status (visível/oculto) e/ou patrocínio de vários anúncios. */
export async function bulkUpdateOffers(
  ids: string[],
  patch: { status?: OfferStatus; isSponsored?: boolean },
): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;

  const data: {
    status?: OfferStatus;
    isSponsored?: boolean;
    sponsoredUntil?: Date | null;
  } = {};
  if (patch.status) data.status = patch.status;
  if (patch.isSponsored !== undefined) {
    data.isSponsored = patch.isSponsored;
    data.sponsoredUntil = null; // patrocínio manual sem prazo
  }
  if (Object.keys(data).length === 0) return;

  await prisma.offer.updateMany({ where: { id: { in: ids } }, data });
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
}

/** Edita o preço de um anúncio (e registra no histórico). */
export async function updateOfferPrice(id: string, price: number): Promise<void> {
  await requireAdmin();
  if (!id || !Number.isFinite(price) || price <= 0) return;
  const value = price.toFixed(2);
  await prisma.offer.update({ where: { id }, data: { price: value } });
  await prisma.priceSnapshot.create({ data: { offerId: id, price: value } });
  revalidatePath("/admin/anuncios");
}
