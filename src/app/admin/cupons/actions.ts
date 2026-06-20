"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

/** Aprova ou rejeita um cupom da comunidade. */
export async function setCouponStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "APPROVED" && status !== "REJECTED")) return;
  await prisma.coupon.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/cupons");
  revalidatePath("/produto", "layout");
}
