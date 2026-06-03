"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

/** Marca a mensagem como resolvida (ou reabre). */
export async function setMessageHandled(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = String(formData.get("handled") ?? "") === "true";
  if (!id) return;
  await prisma.contactMessage.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/mensagens");
}

/** Apaga a mensagem e o anexo (Upload) associado, se houver. */
export async function deleteMessage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const msg = await prisma.contactMessage.findUnique({
    where: { id },
    select: { attachmentId: true },
  });
  await prisma.contactMessage.delete({ where: { id } });
  if (msg?.attachmentId) {
    await prisma.upload
      .delete({ where: { id: msg.attachmentId } })
      .catch(() => undefined);
  }
  revalidatePath("/admin/mensagens");
}
