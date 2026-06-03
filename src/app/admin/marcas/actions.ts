"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const PROMOTE_DAYS = 30;

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function revalidateBrandSurfaces(): void {
  revalidatePath("/admin/marcas");
  revalidatePath("/marcas");
  revalidatePath("/");
}

export async function setBrandLogo(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  const raw = String(formData.get("logoUrl") ?? "").trim();
  if (!brandId) return;
  if (raw && !isValidHttpUrl(raw)) return; // ignora URL inválida
  await prisma.brand.update({
    where: { id: brandId },
    data: { logoUrl: raw || null },
  });
  revalidateBrandSurfaces();
}

export async function promoteBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  if (!brandId) return;
  const until = new Date(Date.now() + PROMOTE_DAYS * 24 * 60 * 60 * 1000);
  await prisma.brand.update({
    where: { id: brandId },
    data: { isPromoted: true, promotedUntil: until },
  });
  revalidateBrandSurfaces();
}

export async function unpromoteBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  if (!brandId) return;
  await prisma.brand.update({
    where: { id: brandId },
    data: { isPromoted: false, promotedUntil: null },
  });
  revalidateBrandSurfaces();
}

/** Define a ordem manual da marca (maior = aparece primeiro). */
export async function setBrandOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  const order = Math.trunc(Number(formData.get("order")));
  if (!brandId || !Number.isFinite(order)) return;
  await prisma.brand.update({
    where: { id: brandId },
    data: { sortOrder: order },
  });
  revalidateBrandSurfaces();
  // Afeta também os chips de marca nas listagens.
  revalidatePath("/filamentos");
  revalidatePath("/resinas");
  revalidatePath("/impressoras");
}
