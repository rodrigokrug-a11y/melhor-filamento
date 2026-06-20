"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireModerator } from "@/lib/permissions";

/** Aprova ou rejeita um cupom da comunidade. */
export async function setCouponStatus(formData: FormData): Promise<void> {
  await requireModerator();
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
