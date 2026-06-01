import { prisma } from "@/lib/db";

/** Gera um slug seguro (sem acentos, minúsculo, hifenizado). */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Slug único para uma loja (adiciona sufixo numérico se já existir). */
export async function uniqueSellerSlug(name: string): Promise<string> {
  const base = slugify(name) || "loja";
  let slug = base;
  let n = 1;
  while (await prisma.seller.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Slug único para um produto. */
export async function uniqueProductSlug(name: string): Promise<string> {
  const base = slugify(name) || "produto";
  let slug = base;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Slug único para uma marca. */
export async function uniqueBrandSlug(name: string): Promise<string> {
  const base = slugify(name) || "marca";
  let slug = base;
  let n = 1;
  while (await prisma.brand.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
