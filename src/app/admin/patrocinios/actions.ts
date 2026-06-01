"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const SPONSOR_DAYS = 30;

export async function sponsorOffer(formData: FormData): Promise<void> {
  await requireAdmin();
  const offerId = String(formData.get("offerId") ?? "");
  if (!offerId) return;
  const until = new Date(Date.now() + SPONSOR_DAYS * 24 * 60 * 60 * 1000);
  const offer = await prisma.offer.update({
    where: { id: offerId },
    data: { isSponsored: true, sponsoredUntil: until },
    include: { product: { select: { slug: true } } },
  });
  revalidatePath("/admin/patrocinios");
  revalidatePath(`/produto/${offer.product.slug}`);
  revalidatePath("/");
}

export async function unsponsorOffer(formData: FormData): Promise<void> {
  await requireAdmin();
  const offerId = String(formData.get("offerId") ?? "");
  if (!offerId) return;
  const offer = await prisma.offer.update({
    where: { id: offerId },
    data: { isSponsored: false, sponsoredUntil: null },
    include: { product: { select: { slug: true } } },
  });
  revalidatePath("/admin/patrocinios");
  revalidatePath(`/produto/${offer.product.slug}`);
  revalidatePath("/");
}
