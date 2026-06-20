"use server";

import { z } from "zod";

import { prisma } from "@/lib/db";
import { getViewer } from "@/lib/permissions";

type State = { error?: string; ok?: boolean };

const CouponSchema = z.object({
  sellerId: z.string().min(1).max(60),
  code: z.string().trim().min(2, "Informe o código do cupom.").max(40),
  description: z.string().trim().max(200).optional(),
  expiresAt: z.string().trim().max(20).optional(),
});

/** Cliente (logado) compartilha um cupom de uma loja → entra como PENDING. */
export async function submitCoupon(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const viewer = await getViewer();
  if (!viewer.id) {
    return { error: "Entre na sua conta para compartilhar um cupom." };
  }

  const parsed = CouponSchema.safeParse({
    sellerId: formData.get("sellerId") ?? "",
    code: formData.get("code") ?? "",
    description: formData.get("description") ?? undefined,
    expiresAt: formData.get("expiresAt") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { sellerId, code, description, expiresAt } = parsed.data;

  const seller = await prisma.seller.findUnique({
    where: { id: sellerId },
    select: { id: true },
  });
  if (!seller) return { error: "Loja inválida." };

  let expires: Date | null = null;
  if (expiresAt) {
    const d = new Date(expiresAt);
    if (!Number.isNaN(d.getTime())) expires = d;
  }

  await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      description: description || null,
      sellerId,
      submittedById: viewer.id,
      submittedByName: viewer.email ?? null,
      expiresAt: expires,
      status: "PENDING",
    },
  });
  return { ok: true };
}
