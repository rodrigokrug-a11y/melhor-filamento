"use server";

import { type OfferStatus } from "@prisma/client";
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
