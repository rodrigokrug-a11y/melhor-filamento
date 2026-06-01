"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { geocode } from "@/lib/geocode";
import { uniqueBrandSlug, uniqueSellerSlug } from "@/lib/slug";
import { lookupCep } from "@/lib/viacep";

const TYPE_MAP = {
  FABRICANTE: "FACTORY",
  REVENDA: "RESELLER",
  MARKETPLACE: "MARKETPLACE",
  DESCONHECIDO: "RESELLER",
} as const;

// Tolerante: aceita campos extras e nulos — o agente preenche o que conseguir.
const SupplierSchema = z
  .object({
    name: z.string().trim().min(1),
    website: z.string().trim().nullish(),
    type: z.string().trim().nullish(),
    brands: z.array(z.string()).nullish(),
    hq: z
      .object({ city: z.string().nullish(), uf: z.string().nullish(), cep: z.string().nullish() })
      .nullish(),
    physical_stores: z
      .array(z.object({ pickup: z.boolean().nullish() }).passthrough())
      .nullish(),
    ingestion: z
      .object({ google_merchant_feed_url: z.string().nullish() })
      .passthrough()
      .nullish(),
  })
  .passthrough();

const PayloadSchema = z.object({ suppliers: z.array(SupplierSchema).min(1) });

export type ImportState = {
  ok?: boolean;
  error?: string;
  summary?: {
    sellersCreated: number;
    sellersUpdated: number;
    brandsCreated: number;
    feedsCreated: number;
    geocoded: number;
    warnings: string[];
  };
};

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function importSuppliers(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();

  const raw = String(formData.get("json") ?? "").trim();
  if (!raw) return { error: "Cole o JSON dos fornecedores." };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: "JSON inválido — verifique a formatação." };
  }
  const payload = Array.isArray(json) ? { suppliers: json } : json;
  const parsed = PayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: 'Formato inesperado. Esperado { "suppliers": [ ... ] }.' };
  }

  const summary = {
    sellersCreated: 0,
    sellersUpdated: 0,
    brandsCreated: 0,
    feedsCreated: 0,
    geocoded: 0,
    warnings: [] as string[],
  };

  // Cache de geocoding por consulta (cidade/UF) + orçamento p/ respeitar o Nominatim.
  const geoCache = new Map<string, { latitude: number; longitude: number } | null>();
  let geoBudget = 150;

  async function findOrCreateBrand(name: string): Promise<boolean> {
    const clean = name.trim();
    if (!clean) return false;
    const existing = await prisma.brand.findFirst({
      where: { name: { equals: clean, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) return false;
    await prisma.brand.create({
      data: { name: clean, slug: await uniqueBrandSlug(clean) },
    });
    return true;
  }

  for (const s of parsed.data.suppliers) {
    try {
      const name = s.name.trim();
      const website = s.website?.trim() || null;
      const host = hostOf(website);
      const typeKey = (s.type ?? "").trim().toUpperCase();
      const type = TYPE_MAP[typeKey as keyof typeof TYPE_MAP] ?? "RESELLER";
      const city = s.hq?.city?.trim() || null;
      const uf = s.hq?.uf?.trim().toUpperCase().slice(0, 2) || null;
      const pickup = (s.physical_stores ?? []).some((p) => p?.pickup === true);

      let existing = host
        ? await prisma.seller.findFirst({
            where: { website: { contains: host, mode: "insensitive" } },
          })
        : null;
      if (!existing) {
        existing = await prisma.seller.findFirst({
          where: { name: { equals: name, mode: "insensitive" } },
        });
      }

      // Geocoding best-effort (não trava o import se falhar).
      let latitude = existing?.latitude ?? null;
      let longitude = existing?.longitude ?? null;
      if (latitude == null && geoBudget > 0) {
        let query: string | null = null;
        try {
          if (s.hq?.cep) {
            const via = await lookupCep(s.hq.cep);
            query = `${via.localidade}, ${via.uf}, Brasil`;
          } else if (city && uf) {
            query = `${city}, ${uf}, Brasil`;
          }
        } catch {
          query = city && uf ? `${city}, ${uf}, Brasil` : null;
        }
        if (query) {
          let coords = geoCache.get(query) ?? null;
          if (!geoCache.has(query)) {
            coords = await geocode(query).catch(() => null);
            geoCache.set(query, coords);
            geoBudget -= 1;
            await sleep(1100);
          }
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
            summary.geocoded += 1;
          }
        }
      }

      let sellerId: string;
      if (existing) {
        const updated = await prisma.seller.update({
          where: { id: existing.id },
          data: {
            type,
            website: website ?? existing.website,
            city: city ?? existing.city,
            uf: uf ?? existing.uf,
            latitude,
            longitude,
            offersPickup: pickup || existing.offersPickup,
          },
        });
        sellerId = updated.id;
        summary.sellersUpdated += 1;
      } else {
        const created = await prisma.seller.create({
          data: {
            name,
            slug: await uniqueSellerSlug(name),
            type,
            website,
            city,
            uf,
            latitude,
            longitude,
            offersPickup: pickup,
          },
        });
        sellerId = created.id;
        summary.sellersCreated += 1;
      }

      for (const b of s.brands ?? []) {
        if (await findOrCreateBrand(b)) summary.brandsCreated += 1;
      }

      const feedUrl = s.ingestion?.google_merchant_feed_url?.trim() || null;
      if (feedUrl) {
        const dup = await prisma.source.findFirst({
          where: { sellerId, url: feedUrl },
          select: { id: true },
        });
        if (!dup) {
          await prisma.source.create({
            data: {
              sellerId,
              kind: "FEED",
              url: feedUrl,
              label: "Google Merchant (importado)",
              enabled: true,
            },
          });
          summary.feedsCreated += 1;
        }
      }
    } catch (e) {
      summary.warnings.push(
        `${s.name}: ${e instanceof Error ? e.message : "erro ao importar"}`,
      );
    }
  }

  revalidatePath("/admin/fornecedores");
  revalidatePath("/admin/lojas");
  revalidatePath("/perto");
  return { ok: true, summary };
}
