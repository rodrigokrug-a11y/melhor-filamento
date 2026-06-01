"use server";

import { z } from "zod";

import { prisma } from "@/lib/db";

type State = { error?: string; ok?: boolean };

const ReviewSchema = z.object({
  productId: z.string().optional(),
  brandId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().optional(),
  comment: z
    .string()
    .trim()
    .min(5, "Escreva um comentário (mín. 5 caracteres)."),
  authorName: z.string().trim().min(2, "Informe seu nome."),
  authorEmail: z.string().trim().optional(),
});

export async function submitReview(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const parsed = ReviewSchema.safeParse({
    productId: formData.get("productId") ?? undefined,
    brandId: formData.get("brandId") ?? undefined,
    rating: formData.get("rating"),
    title: formData.get("title") ?? "",
    comment: formData.get("comment"),
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const productId = d.productId || null;
  const brandId = d.brandId || null;
  if (!productId && !brandId) return { error: "Alvo da avaliação inválido." };

  if (productId) {
    const p = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!p) return { error: "Produto inválido." };
  }
  if (brandId) {
    const b = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });
    if (!b) return { error: "Marca inválida." };
  }

  await prisma.review.create({
    data: {
      productId,
      brandId,
      rating: d.rating,
      title: d.title?.trim() || null,
      comment: d.comment,
      authorName: d.authorName,
      authorEmail: d.authorEmail?.trim() || null,
      status: "PENDING",
    },
  });

  return { ok: true };
}
