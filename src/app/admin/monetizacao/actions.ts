"use server";

import {
  type AdStatus,
  type BannerPlacement,
  type BoostPlacement,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const VALID: AdStatus[] = ["ACTIVE", "PAUSED", "REJECTED", "ENDED"];
const BOOST_PLACEMENTS: BoostPlacement[] = [
  "TOP_FILAMENT",
  "TOP_RESIN",
  "TOP_PRINTER",
];
const BANNER_PLACEMENTS: BannerPlacement[] = [
  "HOME",
  "FILAMENTOS",
  "RESINAS",
  "IMPRESSORAS",
  "MARCAS",
  "COMPARAR",
  "RANKING",
  "DICAS",
  "PRODUTO",
  "GLOBAL",
];

/** Revalida home + listagens (onde aparecem destaque e banners). */
function revalidateListings() {
  revalidatePath("/admin/monetizacao");
  revalidatePath("/");
  revalidatePath("/filamentos");
  revalidatePath("/resinas");
  revalidatePath("/impressoras");
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Converte "1.234,50" / "1234.5" em número (>= 0) ou null. */
function parseBid(raw: unknown): number | null {
  const n = Number(
    String(raw ?? "")
      .replace(/[^\d,.-]/g, "")
      .replace(",", "."),
  );
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// ───────────────────────── Lances de destaque (boosts) ─────────────────────────

/** Admin cria (ou atualiza) um lance de destaque, já ATIVO. Um por loja+categoria. */
export async function createBoost(formData: FormData): Promise<void> {
  await requireAdmin();
  const sellerId = String(formData.get("sellerId") ?? "");
  const placement = String(formData.get("placement") ?? "") as BoostPlacement;
  const bid = parseBid(formData.get("bid"));
  if (!sellerId || !BOOST_PLACEMENTS.includes(placement) || bid === null || bid <= 0)
    return;

  const existing = await prisma.boost.findFirst({
    where: { sellerId, placement },
  });
  if (existing) {
    await prisma.boost.update({
      where: { id: existing.id },
      data: { bidAmount: bid.toFixed(2), status: "ACTIVE", startsAt: new Date() },
    });
  } else {
    await prisma.boost.create({
      data: {
        sellerId,
        placement,
        bidAmount: bid.toFixed(2),
        status: "ACTIVE",
        startsAt: new Date(),
      },
    });
  }
  revalidateListings();
}

/** Admin ajusta o valor de um lance. */
export async function updateBoost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("boostId") ?? "");
  const bid = parseBid(formData.get("bid"));
  if (!id || bid === null || bid <= 0) return;
  await prisma.boost.update({
    where: { id },
    data: { bidAmount: bid.toFixed(2) },
  });
  revalidateListings();
}

export async function deleteBoost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("boostId") ?? "");
  if (!id) return;
  await prisma.boost.delete({ where: { id } });
  revalidateListings();
}

/** Admin ativa/pausa/encerra um lance. */
export async function setBoostStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("boostId") ?? "");
  const status = String(formData.get("status") ?? "") as AdStatus;
  if (!id || !VALID.includes(status)) return;
  await prisma.boost.update({
    where: { id },
    data: { status, ...(status === "ACTIVE" ? { startsAt: new Date() } : {}) },
  });
  revalidateListings();
}

// ───────────────────────────────── Banners ─────────────────────────────────

/** Lê e valida os campos de um banner a partir do formulário. */
function bannerDataFromForm(formData: FormData) {
  const placement = String(formData.get("placement") ?? "") as BannerPlacement;
  if (!BANNER_PLACEMENTS.includes(placement)) return null;
  const title = String(formData.get("title") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  if (!title || !isValidHttpUrl(linkUrl)) return null;
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sellerId = String(formData.get("sellerId") ?? "").trim();
  return {
    placement,
    title,
    subtitle: subtitle || null,
    imageUrl: imageUrl && isValidHttpUrl(imageUrl) ? imageUrl : null,
    linkUrl,
    bidAmount: (parseBid(formData.get("bid")) ?? 0).toFixed(2),
    sellerId: sellerId || null,
  };
}

/** Admin cria um banner, já ATIVO. */
export async function createBanner(formData: FormData): Promise<void> {
  await requireAdmin();
  const data = bannerDataFromForm(formData);
  if (!data) return;
  await prisma.banner.create({
    data: { ...data, status: "ACTIVE", startsAt: new Date() },
  });
  revalidateListings();
}

/** Admin edita um banner. */
export async function updateBanner(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("bannerId") ?? "");
  const data = bannerDataFromForm(formData);
  if (!id || !data) return;
  await prisma.banner.update({ where: { id }, data });
  revalidateListings();
}

export async function deleteBanner(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("bannerId") ?? "");
  if (!id) return;
  await prisma.banner.delete({ where: { id } });
  revalidateListings();
}

/** Admin ativa/pausa/encerra um banner. */
export async function setBannerStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("bannerId") ?? "");
  const status = String(formData.get("status") ?? "") as AdStatus;
  if (!id || !VALID.includes(status)) return;
  await prisma.banner.update({
    where: { id },
    data: { status, ...(status === "ACTIVE" ? { startsAt: new Date() } : {}) },
  });
  revalidateListings();
}
