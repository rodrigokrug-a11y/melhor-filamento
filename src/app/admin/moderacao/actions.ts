"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

async function setStatus(
  formData: FormData,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  await requireAdmin();
  const offerId = String(formData.get("offerId") ?? "");
  if (!offerId) return;
  const offer = await prisma.offer.update({
    where: { id: offerId },
    data: { status },
    include: { product: { select: { slug: true } } },
  });
  revalidatePath("/admin/moderacao");
  revalidatePath("/admin");
  // Páginas estáticas/ISR afetadas pela mudança de visibilidade.
  revalidatePath(`/produto/${offer.product.slug}`);
  revalidatePath("/");
}

export async function approveOffer(formData: FormData): Promise<void> {
  await setStatus(formData, "APPROVED");
}

export async function rejectOffer(formData: FormData): Promise<void> {
  await setStatus(formData, "REJECTED");
}
