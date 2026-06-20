"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const RoleSchema = z.enum(["CLIENTE", "LOJA", "MODERADOR"]);

/** Admin define o papel de um usuário (cliente → loja/moderador, etc.). */
export async function setUserRole(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const parsed = RoleSchema.safeParse(String(formData.get("role") ?? ""));
  if (!userId || !parsed.success) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data },
  });
  revalidatePath("/admin/usuarios");
}
