"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ingestSource } from "@/lib/ingest/run";

const SourceSchema = z.object({
  sellerId: z.string().min(1, "Selecione a loja."),
  kind: z.enum(["PAGE", "FEED", "SITEMAP"]),
  url: z.string().trim().min(1, "Informe a URL."),
  label: z.string().trim().optional(),
});

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createSource(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = SourceSchema.safeParse({
    sellerId: formData.get("sellerId"),
    kind: formData.get("kind"),
    url: formData.get("url"),
    label: formData.get("label") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  if (!isValidHttpUrl(parsed.data.url)) {
    return { error: "Informe uma URL válida (https://...)." };
  }
  const seller = await prisma.seller.findUnique({
    where: { id: parsed.data.sellerId },
    select: { id: true },
  });
  if (!seller) return { error: "Loja inválida." };

  await prisma.source.create({
    data: {
      sellerId: parsed.data.sellerId,
      kind: parsed.data.kind,
      url: parsed.data.url,
      label: parsed.data.label?.trim() || null,
    },
  });
  revalidatePath("/admin/fontes");
  redirect("/admin/fontes");
}

export async function toggleSource(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("sourceId") ?? "");
  const enabled = formData.get("enabled") === "true";
  if (!id) return;
  await prisma.source.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/fontes");
}

export async function deleteSource(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("sourceId") ?? "");
  if (!id) return;
  // Mantém as ofertas, apenas desvincula da fonte removida.
  await prisma.offer.updateMany({
    where: { sourceId: id },
    data: { sourceId: null },
  });
  await prisma.source.delete({ where: { id } });
  revalidatePath("/admin/fontes");
}

export async function runSourceNow(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("sourceId") ?? "");
  if (!id) return;
  await ingestSource(id);
  revalidatePath("/admin/fontes");
  revalidatePath("/admin/moderacao");
  revalidatePath("/admin");
}
