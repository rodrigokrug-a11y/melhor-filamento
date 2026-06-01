"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

async function setStatus(
  formData: FormData,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("tipId") ?? "");
  if (!id) return;
  const tip = await prisma.tip.update({
    where: { id },
    data: { status },
    select: { material: true },
  });
  revalidatePath("/admin/dicas");
  revalidatePath("/dicas");
  revalidatePath(`/dica/${tip.material}`);
}

export async function approveTip(formData: FormData): Promise<void> {
  await setStatus(formData, "APPROVED");
}

export async function rejectTip(formData: FormData): Promise<void> {
  await setStatus(formData, "REJECTED");
}
