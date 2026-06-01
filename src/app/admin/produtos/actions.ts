"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type State = { error?: string };

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name) || "item";
  let slug = base;
  let n = 1;
  while (await exists(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

const BrandSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da marca."),
});

export async function createBrand(
  _prev: State,
  formData: FormData,
): Promise<State> {
  await requireAdmin();
  const parsed = BrandSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const slug = await uniqueSlug(
    parsed.data.name,
    async (s) => (await prisma.brand.findUnique({ where: { slug: s } })) !== null,
  );
  await prisma.brand.create({ data: { name: parsed.data.name, slug } });
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

const ProductSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  kind: z.enum(["FILAMENT", "RESIN"]),
  material: z.enum([
    "PLA",
    "ABS",
    "PETG",
    "TPU",
    "ASA",
    "PCTG",
    "NYLON",
    "RESIN_STANDARD",
    "RESIN_TOUGH",
    "RESIN_WATER_WASHABLE",
    "OUTRO",
  ]),
  brandId: z.string().min(1, "Selecione a marca."),
  color: z.string().trim().min(1, "Informe a cor."),
  netWeightG: z.coerce.number().int().positive("Informe o peso em gramas."),
  diameterMm: z.string().trim().optional().default(""),
});

export async function createProduct(
  _prev: State,
  formData: FormData,
): Promise<State> {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    material: formData.get("material"),
    brandId: formData.get("brandId"),
    color: formData.get("color"),
    netWeightG: formData.get("netWeightG"),
    diameterMm: formData.get("diameterMm") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const brand = await prisma.brand.findUnique({
    where: { id: data.brandId },
    select: { id: true },
  });
  if (!brand) return { error: "Marca inválida." };

  let diameterMm: number | null = null;
  if (data.diameterMm) {
    const n = Number(data.diameterMm);
    if (!Number.isFinite(n) || n <= 0) return { error: "Diâmetro inválido." };
    diameterMm = n;
  }

  const slug = await uniqueSlug(
    data.name,
    async (s) =>
      (await prisma.product.findUnique({ where: { slug: s } })) !== null,
  );
  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      kind: data.kind,
      material: data.material,
      brandId: data.brandId,
      color: data.color,
      netWeightG: data.netWeightG,
      diameterMm,
    },
  });
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}
