"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

/** Marca todos os pedidos de uma marca como resolvidos. */
export async function resolveBrandRequests(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  if (!brandId) return;
  await prisma.offerRequest.updateMany({
    where: { brandId, handled: false },
    data: { handled: true },
  });
  revalidatePath("/admin/solicitacoes");
}
