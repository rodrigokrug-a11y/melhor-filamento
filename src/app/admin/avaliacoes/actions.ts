"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

async function setStatus(
  formData: FormData,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("reviewId") ?? "");
  if (!id) return;
  const review = await prisma.review.update({
    where: { id },
    data: { status },
    include: {
      product: { select: { slug: true } },
      brand: { select: { slug: true } },
    },
  });
  revalidatePath("/admin/avaliacoes");
  revalidatePath("/ranking");
  if (review.product) revalidatePath(`/produto/${review.product.slug}`);
  if (review.brand) revalidatePath(`/marca/${review.brand.slug}`);
}

export async function approveReview(formData: FormData): Promise<void> {
  await setStatus(formData, "APPROVED");
}

export async function rejectReview(formData: FormData): Promise<void> {
  await setStatus(formData, "REJECTED");
}
