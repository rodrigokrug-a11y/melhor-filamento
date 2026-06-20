"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getViewer } from "@/lib/permissions";

type State = { error?: string; ok?: boolean };

const ReplySchema = z.object({
  reviewId: z.string().min(1).max(60),
  body: z.string().trim().min(2, "Escreva uma resposta.").max(1000),
});

/**
 * Dono de loja responde a uma avaliação de um produto que a loja vende.
 * Uma resposta por (avaliação, loja) — reenvio atualiza. Sem moderação.
 */
export async function replyToReview(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const viewer = await getViewer();
  if (!viewer.id) {
    return { error: "Entre na conta da sua loja para responder." };
  }

  const parsed = ReplySchema.safeParse({
    reviewId: formData.get("reviewId") ?? "",
    body: formData.get("body") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { reviewId, body } = parsed.data;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { productId: true },
  });
  if (!review?.productId) return { error: "Avaliação inválida." };

  const seller = await prisma.seller.findFirst({
    where: {
      ownerUserId: viewer.id,
      offers: { some: { productId: review.productId } },
    },
    select: { id: true },
  });
  if (!seller) {
    return { error: "Só uma loja que vende este produto pode responder." };
  }

  await prisma.reviewReply.upsert({
    where: { reviewId_sellerId: { reviewId, sellerId: seller.id } },
    update: { body, authorId: viewer.id },
    create: { reviewId, sellerId: seller.id, authorId: viewer.id, body },
  });
  revalidatePath("/produto", "layout");
  return { ok: true };
}
