"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/db";
import {
  loadProductIndex,
  matchProduct,
  normalizeText,
} from "@/lib/ingest/match";
import { scrapeOffer } from "@/lib/scrape";
import { uniqueSellerSlug } from "@/lib/slug";

type State = { error?: string; ok?: boolean; approved?: boolean };

const OfferSchema = z.object({
  productId: z.string().min(1, "Selecione um produto."),
  storeName: z.string().trim().min(2, "Informe a loja da oferta."),
  price: z.coerce.number().positive("Informe um preço válido (maior que zero)."),
  url: z.string().trim().min(1, "Informe o link da oferta."),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"]),
  couponCode: z.string().trim().optional().default(""),
  couponType: z.string().trim().optional().default(""),
  couponDiscount: z.string().trim().optional().default(""),
  authorName: z.string().trim().min(2, "Informe seu nome."),
  authorEmail: z.string().trim().optional().default(""),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Encontra a loja pelo nome (case-insensitive) ou cria uma nova (não verificada). */
async function resolveSellerId(storeName: string): Promise<string> {
  const existing = await prisma.seller.findFirst({
    where: { name: { equals: storeName, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.seller.create({
    data: {
      name: storeName,
      slug: await uniqueSellerSlug(storeName),
      type: "RESELLER",
      isVerified: false,
    },
    select: { id: true },
  });
  return created.id;
}

export async function createOffer(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await auth();
  const isAdmin = isAdminEmail(session?.user?.email);

  const parsed = OfferSchema.safeParse({
    productId: formData.get("productId"),
    storeName: formData.get("storeName"),
    price: formData.get("price"),
    url: formData.get("url"),
    stockStatus: formData.get("stockStatus"),
    couponCode: formData.get("couponCode") ?? "",
    couponType: formData.get("couponType") ?? "",
    couponDiscount: formData.get("couponDiscount") ?? "",
    authorName: formData.get("authorName") || session?.user?.name || "",
    authorEmail: formData.get("authorEmail") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  // E-mail: usa o da conta se logado; senão exige um válido.
  const email = session?.user?.email ?? data.authorEmail;
  if (!session?.user && (!email || !EMAIL_RE.test(email))) {
    return { error: "Informe um e-mail válido." };
  }

  if (!isValidHttpUrl(data.url)) {
    return { error: "Informe um link válido (https://...)." };
  }

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { id: true, slug: true },
  });
  if (!product) return { error: "Produto inválido." };

  let couponCode: string | null = null;
  let couponType: "PERCENT" | "FIXED" | null = null;
  let couponDiscount: string | null = null;
  if (data.couponCode) {
    if (data.couponType !== "PERCENT" && data.couponType !== "FIXED") {
      return { error: "Selecione o tipo do cupom." };
    }
    const discount = Number(data.couponDiscount);
    if (!Number.isFinite(discount) || discount <= 0) {
      return { error: "Informe o valor de desconto do cupom." };
    }
    if (data.couponType === "PERCENT" && discount > 100) {
      return { error: "O desconto percentual não pode passar de 100%." };
    }
    couponCode = data.couponCode;
    couponType = data.couponType;
    couponDiscount = discount.toFixed(2);
  }

  const sellerId = await resolveSellerId(data.storeName);

  const offer = await prisma.offer.create({
    data: {
      productId: product.id,
      sellerId,
      price: data.price.toFixed(2),
      url: data.url,
      stockStatus: data.stockStatus,
      status: isAdmin ? "APPROVED" : "PENDING",
      couponCode,
      couponType,
      couponDiscount,
      submittedByName: data.authorName,
      submittedByEmail: email || null,
      submittedByUserId: session?.user?.id ?? null,
    },
    select: { id: true },
  });

  // Registra o preço no histórico.
  await prisma.priceSnapshot.create({
    data: { offerId: offer.id, price: data.price.toFixed(2) },
  });

  if (isAdmin) {
    revalidatePath(`/produto/${product.slug}`);
    revalidatePath("/filamentos");
    revalidatePath("/resinas");
  }

  return { ok: true, approved: isAdmin };
}

// ───────────── Puxar dados do link ─────────────

type ScrapeResult = {
  error?: string;
  name?: string | null;
  price?: number | null;
  image?: string | null;
  store?: string | null;
  productId?: string | null;
};

/** Página de desafio anti-bot (Cloudflare etc.) — não é o produto. */
const BLOCKED_RE =
  /just a moment|attention required|verify you are human|checking your browser|cloudflare/i;

/** Bloqueia URLs não-públicas (proteção básica contra SSRF). */
function isSafePublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  return !(
    h === "localhost" ||
    h.endsWith(".local") ||
    h === "0.0.0.0" ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

/** Lê um link de produto e devolve dados para preencher o formulário. */
export async function scrapeOfferForForm(url: string): Promise<ScrapeResult> {
  const trimmed = url.trim();
  if (!trimmed) return { error: "Cole o link da oferta primeiro." };
  if (!isSafePublicUrl(trimmed)) {
    return { error: "Informe um link público válido (https://...)." };
  }

  let extracted;
  try {
    extracted = await scrapeOffer(trimmed);
  } catch {
    return { error: "Não consegui ler a página desse link." };
  }
  if (BLOCKED_RE.test(extracted.name ?? "")) {
    return {
      error:
        "Esta loja bloqueia leitura automática (proteção anti-bot). Preencha manualmente.",
    };
  }

  let store: string | null = null;
  try {
    store = new URL(trimmed).hostname.replace(/^www\./, "");
  } catch {
    store = null;
  }

  const index = await loadProductIndex();
  let productId = matchProduct(extracted, index);
  // Match aproximado (nome do catálogo contido no título extraído).
  if (!productId && extracted.name) {
    const cand = normalizeText(extracted.name);
    const loose = index.find((p) => {
      const pn = normalizeText(p.name);
      return pn.length > 6 && (cand.includes(pn) || pn.includes(cand));
    });
    productId = loose?.id ?? null;
  }

  return {
    name: extracted.name,
    price: extracted.price,
    image: extracted.image,
    store,
    productId,
  };
}
