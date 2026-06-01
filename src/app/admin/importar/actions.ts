"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createProductFromExtracted } from "@/lib/ingest/create-product";
import { loadProductIndex, matchProduct } from "@/lib/ingest/match";
import { scrapeOffer } from "@/lib/scrape";

type ImportState = {
  error?: string;
  message?: string;
  preview?: {
    name: string | null;
    price: number | null;
    image: string | null;
    product: string | null;
    source: string;
  };
};

export async function importFromUrl(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();
  const url = String(formData.get("url") ?? "").trim();
  const sellerId = String(formData.get("sellerId") ?? "");
  if (!url) return { error: "Informe a URL do produto." };
  if (!sellerId) return { error: "Selecione a loja." };

  let extracted;
  try {
    extracted = await scrapeOffer(url);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao ler a página." };
  }
  if (
    /just a moment|attention required|verify you are human|checking your browser|cloudflare/i.test(
      extracted.name ?? "",
    )
  ) {
    return {
      error:
        "Esta loja bloqueia importação automática (proteção anti-bot). Cadastre manualmente.",
    };
  }

  const preview = {
    name: extracted.name,
    price: extracted.price,
    image: extracted.image,
    product: null as string | null,
    source: extracted.source,
  };

  if (extracted.price == null) {
    return { error: "Não encontrei o preço na página.", preview };
  }

  const index = await loadProductIndex();
  let productId = matchProduct(extracted, index);
  let productName = index.find((p) => p.id === productId)?.name ?? null;
  let createdProduct = false;
  if (!productId) {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { name: true },
    });
    const created = await createProductFromExtracted(
      extracted,
      seller?.name ?? null,
    );
    productId = created.id;
    productName = created.name;
    createdProduct = true;
  }
  preview.product = productName;

  const price = extracted.price.toFixed(2);
  const stockStatus =
    extracted.availability === "OUT_OF_STOCK"
      ? "OUT_OF_STOCK"
      : extracted.availability === "IN_STOCK"
        ? "IN_STOCK"
        : "UNKNOWN";

  const existing = await prisma.offer.findFirst({
    where: { sellerId, productId, sourceId: null },
    select: { id: true },
  });
  let offerId: string;
  if (existing) {
    await prisma.offer.update({
      where: { id: existing.id },
      data: { price, url, stockStatus },
    });
    offerId = existing.id;
  } else {
    const created = await prisma.offer.create({
      data: { sellerId, productId, price, url, stockStatus, status: "APPROVED" },
      select: { id: true },
    });
    offerId = created.id;
  }
  await prisma.priceSnapshot.create({ data: { offerId, price } });
  if (extracted.image) {
    await prisma.product.updateMany({
      where: { id: productId, imageUrl: null },
      data: { imageUrl: extracted.image },
    });
  }

  revalidatePath("/admin/moderacao");
  revalidatePath("/filamentos");
  revalidatePath("/resinas");
  return {
    message: createdProduct
      ? `Produto "${productName}" criado e oferta publicada.`
      : `Oferta de "${productName}" criada/atualizada e publicada.`,
    preview,
  };
}
