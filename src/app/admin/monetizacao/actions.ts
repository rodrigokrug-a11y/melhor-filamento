"use server";

import { type AdStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const VALID: AdStatus[] = ["ACTIVE", "PAUSED", "REJECTED", "ENDED"];

function revalidateListings() {
  revalidatePath("/");
  revalidatePath("/filamentos");
  revalidatePath("/resinas");
  revalidatePath("/impressoras");
}

/** Admin aprova/recusa/encerra um lance de destaque. */
export async function setBoostStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("boostId") ?? "");
  const status = String(formData.get("status") ?? "") as AdStatus;
  if (!id || !VALID.includes(status)) return;
  await prisma.boost.update({
    where: { id },
    data: { status, ...(status === "ACTIVE" ? { startsAt: new Date() } : {}) },
  });
  revalidatePath("/admin/monetizacao");
  revalidateListings();
}

/** Admin aprova/recusa/encerra um banner. */
export async function setBannerStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("bannerId") ?? "");
  const status = String(formData.get("status") ?? "") as AdStatus;
  if (!id || !VALID.includes(status)) return;
  await prisma.banner.update({
    where: { id },
    data: { status, ...(status === "ACTIVE" ? { startsAt: new Date() } : {}) },
  });
  revalidatePath("/admin/monetizacao");
  revalidatePath("/");
}
