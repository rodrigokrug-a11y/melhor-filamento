"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
