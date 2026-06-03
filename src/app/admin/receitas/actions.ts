"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function setRecipeStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "APPROVED" && status !== "REJECTED")) return;
  await prisma.recipe.update({
    where: { id },
    data: { status: status as "APPROVED" | "REJECTED" },
  });
  revalidatePath("/admin/receitas");
  revalidatePath("/receitas");
}
