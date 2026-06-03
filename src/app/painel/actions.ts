"use server";

import {
  type BannerPlacement,
  type BoostPlacement,
  type OfferStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** Retorna a oferta SE ela pertence à loja do usuário logado (segurança). */
async function myOffer(offerId: string) {
  const session = await auth();
  if (!session?.user?.id || !offerId) return null;
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      seller: { select: { ownerUserId: true } },
      product: { select: { slug: true } },
    },
  });
  if (!offer || offer.seller.ownerUserId !== session.user.id) return null;
  return offer;
}

type State = { error?: string };

const SellerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja (mín. 2 caracteres)."),
  type: z.enum(["FACTORY", "RESELLER", "MARKETPLACE"]),
  website: z.string().trim().optional(),
});

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "loja";
  let slug = base;
  let n = 1;
  while (await prisma.seller.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createSeller(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Faça login para continuar." };

  const parsed = SellerSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const website = parsed.data.website?.trim() ?? "";
  if (website && !isValidHttpUrl(website)) {
    return { error: "Informe uma URL válida (https://...)." };
  }

  const existing = await prisma.seller.findUnique({
    where: { ownerUserId: session.user.id },
  });
  if (!existing) {
    await prisma.seller.create({
      data: {
        name: parsed.data.name,
        slug: await uniqueSlug(parsed.data.name),
        type: parsed.data.type,
        website: website || null,
        ownerUserId: session.user.id,
      },
    });
  }

  redirect("/painel");
}

/** A loja edita a própria oferta: preço, link, cupom e foto. */
export async function updateMyOffer(formData: FormData): Promise<void> {
  const offer = await myOffer(String(formData.get("offerId") ?? ""));
  if (!offer) return;

  const data: {
    price?: string;
    url?: string;
    couponCode?: string | null;
    imageUrl?: string | null;
  } = {};

  const priceN = Number(
    String(formData.get("price") ?? "")
      .replace(/[^\d,.-]/g, "")
      .replace(",", "."),
  );
  if (Number.isFinite(priceN) && priceN > 0) data.price = priceN.toFixed(2);

  const url = String(formData.get("url") ?? "").trim();
  if (url && isValidHttpUrl(url)) data.url = url;

  const coupon = String(formData.get("couponCode") ?? "").trim();
  data.couponCode = coupon || null;

  const img = String(formData.get("imageUrl") ?? "").trim();
  if (img === "") data.imageUrl = null;
  else if (isValidHttpUrl(img)) data.imageUrl = img;

  await prisma.offer.update({ where: { id: offer.id }, data });
  if (data.price) {
    await prisma.priceSnapshot.create({
      data: { offerId: offer.id, price: data.price },
    });
  }
  revalidatePath("/painel");
  revalidatePath(`/produto/${offer.product.slug}`);
}

/** A loja ativa (APPROVED) ou pausa (PENDING) a própria oferta. */
export async function setMyOfferStatus(formData: FormData): Promise<void> {
  const offer = await myOffer(String(formData.get("offerId") ?? ""));
  const status = String(formData.get("status") ?? "") as OfferStatus;
  if (!offer || (status !== "APPROVED" && status !== "PENDING")) return;
  await prisma.offer.update({ where: { id: offer.id }, data: { status } });
  revalidatePath("/painel");
  revalidatePath(`/produto/${offer.product.slug}`);
}

/** Loja do usuário logado (ou null). */
async function mySeller() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.seller.findUnique({
    where: { ownerUserId: session.user.id },
    select: { id: true },
  });
}

const BOOST_PLACEMENTS: BoostPlacement[] = [
  "TOP_FILAMENT",
  "TOP_RESIN",
  "TOP_PRINTER",
];

/** A loja dá/aumenta um lance de destaque (pay-to-top). Entra PENDING. */
export async function placeBoost(formData: FormData): Promise<void> {
  const seller = await mySeller();
  if (!seller) return;
  const placement = String(formData.get("placement") ?? "") as BoostPlacement;
  if (!BOOST_PLACEMENTS.includes(placement)) return;
  const bid = Number(
    String(formData.get("bid") ?? "")
      .replace(/[^\d,.-]/g, "")
      .replace(",", "."),
  );
  if (!Number.isFinite(bid) || bid <= 0) return;

  const existing = await prisma.boost.findFirst({
    where: { sellerId: seller.id, placement },
  });
  if (existing) {
    await prisma.boost.update({
      where: { id: existing.id },
      data: { bidAmount: bid.toFixed(2) },
    });
  } else {
    await prisma.boost.create({
      data: { sellerId: seller.id, placement, bidAmount: bid.toFixed(2) },
    });
  }
  revalidatePath("/painel");
}

export async function cancelBoost(formData: FormData): Promise<void> {
  const seller = await mySeller();
  const id = String(formData.get("boostId") ?? "");
  if (!seller || !id) return;
  const boost = await prisma.boost.findUnique({
    where: { id },
    select: { sellerId: true },
  });
  if (!boost || boost.sellerId !== seller.id) return;
  await prisma.boost.delete({ where: { id } });
  revalidatePath("/painel");
}

const BANNER_PLACEMENTS: BannerPlacement[] = ["HOME", "GLOBAL"];

/** A loja envia um banner (PENDING) com um lance. */
export async function submitBanner(formData: FormData): Promise<void> {
  const seller = await mySeller();
  if (!seller) return;
  const placement = String(formData.get("placement") ?? "") as BannerPlacement;
  if (!BANNER_PLACEMENTS.includes(placement)) return;
  const title = String(formData.get("title") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  if (!title || !isValidHttpUrl(linkUrl)) return;
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const bid = Number(
    String(formData.get("bid") ?? "")
      .replace(/[^\d,.-]/g, "")
      .replace(",", "."),
  );
  await prisma.banner.create({
    data: {
      sellerId: seller.id,
      placement,
      title,
      subtitle: subtitle || null,
      imageUrl: imageUrl && isValidHttpUrl(imageUrl) ? imageUrl : null,
      linkUrl,
      bidAmount: Number.isFinite(bid) && bid > 0 ? bid.toFixed(2) : "0",
    },
  });
  revalidatePath("/painel");
}

export async function deleteMyBanner(formData: FormData): Promise<void> {
  const seller = await mySeller();
  const id = String(formData.get("bannerId") ?? "");
  if (!seller || !id) return;
  const banner = await prisma.banner.findUnique({
    where: { id },
    select: { sellerId: true },
  });
  if (!banner || banner.sellerId !== seller.id) return;
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/painel");
}
