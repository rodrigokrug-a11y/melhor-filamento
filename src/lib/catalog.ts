import { cache } from "react";
import { Prisma } from "@prisma/client";

import {
  type BrandPage,
  type BrandSummary,
  type CatalogFilters,
  type CatalogResult,
  type CatalogSort,
  type CompareProduct,
  type FacetOption,
  type NearbyStore,
  type OfferShippingLite,
  type OfferView,
  type ProductDetail,
  type ProductKind,
  type ProductListItem,
  materialLabel,
} from "@/lib/catalog-types";
import { prisma } from "@/lib/db";
import {
  type CouponType,
  discountAmount,
  effectivePrice,
  isSponsoredActive,
  rankOffers,
} from "@/lib/pricing";
import { type ShippingRuleLite } from "@/lib/shipping";

const ACTIVE_OFFER_WHERE = {
  status: "APPROVED",
  stockStatus: { not: "OUT_OF_STOCK" },
} as const;

const PRODUCT_WITH_OFFERS = {
  brand: true,
  offers: {
    where: ACTIVE_OFFER_WHERE,
    include: { seller: { include: { shippingRules: true } } },
  },
} satisfies Prisma.ProductInclude;

type ProductWithOffers = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_WITH_OFFERS;
}>;

function toNumber(value: unknown): number {
  return Number(value);
}

function mapShippingRules(
  rules: {
    scope: string;
    region: string | null;
    uf: string | null;
    baseCost: unknown;
    freeShippingThreshold: unknown;
    estimatedDays: number;
  }[],
): ShippingRuleLite[] {
  return rules.map((r) => ({
    scope: r.scope as ShippingRuleLite["scope"],
    region: (r.region as ShippingRuleLite["region"]) ?? null,
    uf: r.uf,
    baseCost: toNumber(r.baseCost),
    freeShippingThreshold:
      r.freeShippingThreshold != null ? toNumber(r.freeShippingThreshold) : null,
    estimatedDays: r.estimatedDays,
  }));
}

/** Mapeia uma oferta do Prisma para a view cliente (preço efetivo, frete, etc.). */
function buildOfferView(
  o: ProductWithOffers["offers"][number],
  now: Date,
): OfferView {
  const price = toNumber(o.price);
  const couponDiscount =
    o.couponDiscount != null ? toNumber(o.couponDiscount) : null;
  const couponType = o.couponType as CouponType | null;
  const coupon = { price, couponType, couponDiscount };
  return {
    id: o.id,
    sellerName: o.seller.name,
    sellerSlug: o.seller.slug,
    sellerType: o.seller.type,
    sellerVerified: o.seller.isVerified,
    sellerLogoUrl: o.seller.logoUrl,
    url: o.url,
    price,
    couponCode: o.couponCode,
    couponType,
    discount: discountAmount(coupon),
    effectivePrice: effectivePrice(coupon),
    sponsoredActive: isSponsoredActive(o.isSponsored, o.sponsoredUntil, now),
    shippingRules: mapShippingRules(o.seller.shippingRules),
    submittedByName: o.submittedByName,
  };
}

/** Constrói o item de listagem de um produto (null se não há oferta ativa). */
function buildListItem(p: ProductWithOffers): ProductListItem | null {
  if (p.offers.length === 0) return null;

  let bestPrice = Infinity;
  let bestPriceHasCoupon = false;
  let bestDiscountPct = 0;
  const offersLite: OfferShippingLite[] = [];
  for (const o of p.offers) {
    const price = toNumber(o.price);
    const couponDiscount =
      o.couponDiscount != null ? toNumber(o.couponDiscount) : null;
    const coupon = {
      price,
      couponType: o.couponType as CouponType | null,
      couponDiscount,
    };
    const eff = effectivePrice(coupon);
    if (eff < bestPrice) {
      bestPrice = eff;
      const disc = discountAmount(coupon);
      bestPriceHasCoupon = disc > 0;
      bestDiscountPct =
        disc > 0 && price > 0 ? Math.round((disc / price) * 100) : 0;
    }
    offersLite.push({
      effectivePrice: eff,
      shippingRules: mapShippingRules(o.seller.shippingRules),
    });
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    kind: p.kind as ProductKind,
    material: p.material,
    color: p.color,
    tech: (p.specs as Record<string, string> | null)?.tecnologia ?? null,
    netWeightG: p.netWeightG,
    diameterMm: p.diameterMm,
    imageUrl: p.imageUrl,
    brandName: p.brand.name,
    brandSlug: p.brand.slug,
    offerCount: p.offers.length,
    bestPrice,
    bestPriceHasCoupon,
    discountPct: bestDiscountPct,
    boost: null,
    sortOrder: p.sortOrder,
    offers: offersLite,
  };
}

function sortProducts(
  products: ProductListItem[],
  sort: CatalogSort = "preco-asc",
): ProductListItem[] {
  const sorted = [...products];
  switch (sort) {
    case "preco-desc":
      sorted.sort((a, b) => b.bestPrice - a.bestPrice);
      break;
    case "nome":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      break;
    case "preco-asc":
    default:
      sorted.sort((a, b) => a.bestPrice - b.bestPrice);
      break;
  }
  return sorted;
}

/**
 * Busca textual em todo o catálogo (nome, marca e cor), por tokens — cada
 * palavra precisa aparecer em algum campo. Só produtos com oferta ativa.
 */
export const searchProducts = cache(
  async (query: string, sort: CatalogSort = "preco-asc"): Promise<ProductListItem[]> => {
    const q = query.trim();
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/).filter(Boolean).slice(0, 6);

    const rows = await prisma.product.findMany({
      where: {
        offers: { some: ACTIVE_OFFER_WHERE },
        AND: tokens.map((tok) => ({
          OR: [
            { name: { contains: tok, mode: "insensitive" as const } },
            { brand: { name: { contains: tok, mode: "insensitive" as const } } },
            { color: { contains: tok, mode: "insensitive" as const } },
          ],
        })),
      },
      include: PRODUCT_WITH_OFFERS,
      take: 80,
    });

    const items = rows
      .map(buildListItem)
      .filter((x): x is ProductListItem => x !== null);
    return sortProducts(items, sort);
  },
);

export type SearchSuggestion = {
  slug: string;
  name: string;
  brandName: string;
  kind: ProductKind;
};

/** Sugestões rápidas para autocomplete (sem ofertas/preço — leve por tecla). */
export async function searchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 6);

  const rows = await prisma.product.findMany({
    where: {
      offers: { some: ACTIVE_OFFER_WHERE },
      AND: tokens.map((tok) => ({
        OR: [
          { name: { contains: tok, mode: "insensitive" as const } },
          { brand: { name: { contains: tok, mode: "insensitive" as const } } },
          { color: { contains: tok, mode: "insensitive" as const } },
        ],
      })),
    },
    select: {
      slug: true,
      name: true,
      kind: true,
      brand: { select: { name: true } },
    },
    take: 7,
    orderBy: { name: "asc" },
  });

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    brandName: r.brand.name,
    kind: r.kind as ProductKind,
  }));
}

/** Produtos por slug (com oferta ativa), preservando a ordem informada. */
export async function getProductsBySlugs(
  slugs: string[],
): Promise<ProductListItem[]> {
  const unique = [...new Set(slugs.filter(Boolean))].slice(0, 100);
  if (unique.length === 0) return [];

  const rows = await prisma.product.findMany({
    where: { slug: { in: unique }, offers: { some: ACTIVE_OFFER_WHERE } },
    include: PRODUCT_WITH_OFFERS,
  });

  const byslug = new Map(rows.map((r) => [r.slug, r]));
  return unique
    .map((s) => byslug.get(s))
    .filter((r): r is ProductWithOffers => r != null)
    .map(buildListItem)
    .filter((x): x is ProductListItem => x !== null);
}

/**
 * Ofertas do dia: produtos com cupom OU com queda de preço frente ao pico
 * recente (até 45 dias de histórico). `discountPct` reflete a maior economia.
 */
export const getDeals = cache(
  async (limit = 36, minPct = 5): Promise<ProductListItem[]> => {
    const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

    const [rows, snaps] = await Promise.all([
      prisma.product.findMany({
        where: { offers: { some: ACTIVE_OFFER_WHERE } },
        include: PRODUCT_WITH_OFFERS,
      }),
      prisma.priceSnapshot.findMany({
        where: { createdAt: { gte: since }, offer: { status: "APPROVED" } },
        select: { price: true, offer: { select: { productId: true } } },
      }),
    ]);

    // Maior preço por produto no período (pico recente).
    const peak = new Map<string, number>();
    for (const s of snaps) {
      const pid = s.offer.productId;
      const price = toNumber(s.price);
      const cur = peak.get(pid);
      if (cur == null || price > cur) peak.set(pid, price);
    }

    const deals: ProductListItem[] = [];
    for (const p of rows) {
      const li = buildListItem(p);
      if (!li) continue;
      const curRaw = Math.min(...p.offers.map((o) => toNumber(o.price)));
      const histMax = peak.get(p.id) ?? 0;
      const dropPct =
        histMax > 0 && curRaw < histMax
          ? Math.min(90, Math.round((1 - curRaw / histMax) * 100))
          : 0;
      const dealPct = Math.max(li.discountPct, dropPct);
      if (dealPct >= minPct) deals.push({ ...li, discountPct: dealPct });
    }

    return deals
      .sort((a, b) => b.discountPct - a.discountPct || a.bestPrice - b.bestPrice)
      .slice(0, limit);
  },
);

function buildFacets(
  items: { value: string; label: string }[],
): FacetOption[] {
  const map = new Map<string, FacetOption>();
  for (const { value, label } of items) {
    const existing = map.get(value);
    if (existing) existing.count += 1;
    else map.set(value, { value, label, count: 1 });
  }
  return [...map.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR"),
  );
}

/**
 * Catálogo de uma categoria: produtos do tipo com ofertas ativas, com o menor
 * preço efetivo de cada um e as facetas (material, marca). Filtro/ordenação em
 * memória — adequado à escala atual.
 */
export const getCatalog = cache(
  async (
    kind: ProductKind,
    filters: CatalogFilters = {},
  ): Promise<CatalogResult> => {
    const rows = await prisma.product.findMany({
      where: { kind },
      include: PRODUCT_WITH_OFFERS,
      orderBy: { name: "asc" },
    });

    // Lances de destaque ativos desta categoria (leilão pay-to-top).
    const placement =
      kind === "RESIN"
        ? "TOP_RESIN"
        : kind === "PRINTER"
          ? "TOP_PRINTER"
          : "TOP_FILAMENT";
    const activeBoosts = await prisma.boost.findMany({
      where: { placement, status: "ACTIVE" },
      select: { sellerId: true, bidAmount: true },
    });
    const boostBySeller = new Map(
      activeBoosts.map((b) => [b.sellerId, Number(b.bidAmount)]),
    );

    const all: ProductListItem[] = [];
    const brandLogos = new Map<string, string | null>();
    const brandOrder = new Map<string, number>();
    for (const p of rows) {
      const item = buildListItem(p);
      if (!item) continue;
      let boost: number | null = null;
      for (const o of p.offers) {
        const b = boostBySeller.get(o.sellerId);
        if (b != null && (boost == null || b > boost)) boost = b;
      }
      item.boost = boost;
      all.push(item);
      if (!brandLogos.has(p.brand.slug)) {
        brandLogos.set(p.brand.slug, p.brand.logoUrl);
        brandOrder.set(p.brand.slug, p.brand.sortOrder);
      }
    }

    const materials = buildFacets(
      all.map((p) => ({ value: p.material, label: materialLabel(p.material) })),
    );
    const brands = buildFacets(
      all.map((p) => ({ value: p.brandSlug, label: p.brandName })),
    )
      .map((f) => ({ ...f, logoUrl: brandLogos.get(f.value) ?? null }))
      // Ordem manual do admin primeiro (maior sortOrder), depois alfabética.
      .sort(
        (a, b) =>
          (brandOrder.get(b.value) ?? 0) - (brandOrder.get(a.value) ?? 0) ||
          a.label.localeCompare(b.label, "pt-BR"),
      );
    // Cores reais como faceta (ignora "Variado", que é cor desconhecida).
    const colors = buildFacets(
      all
        .filter((p) => p.color && p.color !== "Variado")
        .map((p) => ({ value: p.color, label: p.color })),
    );
    // Tecnologia (impressoras) — vinda de specs.tecnologia.
    const techs = buildFacets(
      all
        .filter((p) => p.tech)
        .map((p) => ({ value: p.tech as string, label: p.tech as string })),
    );

    let products = all;
    if (filters.material) {
      products = products.filter((p) => p.material === filters.material);
    }
    if (filters.marca) {
      products = products.filter((p) => p.brandSlug === filters.marca);
    }
    if (filters.cor) {
      products = products.filter((p) => p.color === filters.cor);
    }
    if (filters.tech) {
      products = products.filter((p) => p.tech === filters.tech);
    }
    products = sortProducts(products, filters.sort);
    // Destaque pago acima da ordenação base (maior lance primeiro).
    products = [...products].sort((a, b) => (b.boost ?? 0) - (a.boost ?? 0));
    // Ordem manual do admin tem prioridade máxima (maior sortOrder primeiro).
    // Por padrão sortOrder=0 em tudo → não altera nada (ordenação estável).
    products = [...products].sort(
      (a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0),
    );

    return { products, materials, brands, colors, techs };
  },
);

export const getProductDetail = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_WITH_OFFERS,
    });
    if (!p) return null;

    const now = new Date();
    const offers: OfferView[] = p.offers.map((o) => buildOfferView(o, now));

    const ranked = rankOffers(offers);
    const bestPrice = ranked.length
      ? Math.min(...ranked.map((o) => o.effectivePrice))
      : null;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      kind: p.kind as ProductKind,
      material: p.material,
      materialLabel: materialLabel(p.material),
      color: p.color,
      netWeightG: p.netWeightG,
      diameterMm: p.diameterMm,
      imageUrl: p.imageUrl,
      specs: (p.specs as Record<string, string> | null) ?? null,
      brandName: p.brand.name,
      brandSlug: p.brand.slug,
      offers: ranked,
      bestPrice,
    };
  },
);

/**
 * Produtos comparáveis (com oferta ativa) e todas as suas ofertas, para o
 * comparador dinâmico. Filtro/ordenação acontecem no cliente (controles ao vivo).
 */
export const getComparableProducts = cache(
  async (kind: ProductKind = "FILAMENT"): Promise<CompareProduct[]> => {
    const rows = await prisma.product.findMany({
      where: { kind, offers: { some: ACTIVE_OFFER_WHERE } },
      include: PRODUCT_WITH_OFFERS,
      orderBy: { name: "asc" },
    });
    const now = new Date();
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      kind: p.kind as ProductKind,
      material: p.material,
      brandName: p.brand.name,
      color: p.color,
      imageUrl: p.imageUrl,
      netWeightG: p.netWeightG,
      diameterMm: p.diameterMm,
      specs: (p.specs as Record<string, string> | null) ?? null,
      offers: p.offers.map((o) => buildOfferView(o, now)),
    }));
  },
);

/**
 * Histórico do menor preço por dia de um produto (últimos `days` dias),
 * a partir dos snapshots de preço das ofertas aprovadas.
 */
export const getPriceHistory = cache(
  async (
    productId: string,
    days = 30,
  ): Promise<{ date: string; price: number }[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const snaps = await prisma.priceSnapshot.findMany({
      where: {
        createdAt: { gte: since },
        offer: { productId, status: "APPROVED" },
      },
      select: { price: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const byDay = new Map<string, number>();
    for (const s of snaps) {
      const day = s.createdAt.toISOString().slice(0, 10);
      const price = Number(s.price);
      const current = byDay.get(day);
      if (current == null || price < current) byDay.set(day, price);
    }
    return [...byDay.entries()]
      .map(([date, price]) => ({ date, price }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
);

/** Lojas com localização e oferta ativa, para o mapa "perto de você". */
export const getStoresForMap = cache(async (): Promise<NearbyStore[]> => {
  const sellers = await prisma.seller.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      // Sem filtro de "tem oferta": o mapa também funciona como diretório de
      // lojas 3D perto de você. Lojas sem oferta aparecem sem preço.
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      uf: true,
      latitude: true,
      longitude: true,
      offersPickup: true,
      isVerified: true,
      offers: {
        where: ACTIVE_OFFER_WHERE,
        select: {
          price: true,
          couponType: true,
          couponDiscount: true,
          product: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return sellers.map((s) => {
    let cheapest = Infinity;
    let cheapestProduct: { name: string; slug: string } | null = null;
    for (const o of s.offers) {
      const eff = effectivePrice({
        price: toNumber(o.price),
        couponType: o.couponType as CouponType | null,
        couponDiscount: o.couponDiscount != null ? toNumber(o.couponDiscount) : null,
      });
      if (eff < cheapest) {
        cheapest = eff;
        cheapestProduct = o.product;
      }
    }
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      city: s.city,
      uf: s.uf,
      latitude: s.latitude as number,
      longitude: s.longitude as number,
      offersPickup: s.offersPickup,
      isVerified: s.isVerified,
      offerCount: s.offers.length,
      cheapestPrice: Number.isFinite(cheapest) ? cheapest : null,
      cheapestProduct,
    };
  });
});

/** Página de uma marca: dados da marca + seus produtos (com oferta ativa). */
export const getBrandWithProducts = cache(
  async (slug: string): Promise<BrandPage | null> => {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: { include: PRODUCT_WITH_OFFERS, orderBy: { name: "asc" } },
      },
    });
    if (!brand) return null;

    const products = brand.products
      .map(buildListItem)
      .filter((x): x is ProductListItem => x !== null)
      .sort((a, b) => a.bestPrice - b.bestPrice);

    return {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      logoUrl: brand.logoUrl,
      promotedActive: isSponsoredActive(
        brand.isPromoted,
        brand.promotedUntil,
        new Date(),
      ),
      profile: {
        website: brand.website,
        country: brand.country,
        headquarters: brand.headquarters,
        summary: brand.summary,
        sells: brand.sells,
        about: brand.about,
        foundedYear: brand.foundedYear,
      },
      products,
    };
  },
);

/** Marcas com contagem de produtos (com oferta ativa), patrocinadas primeiro. */
export const getBrandsOverview = cache(async (): Promise<BrandSummary[]> => {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { offers: { some: ACTIVE_OFFER_WHERE } },
        select: { id: true },
      },
    },
  });
  const now = new Date();
  return brands
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      logoUrl: b.logoUrl,
      productCount: b.products.length,
      promotedActive: isSponsoredActive(b.isPromoted, b.promotedUntil, now),
      sortOrder: b.sortOrder,
    }))
    .sort((a, b) => {
      // Ordem manual do admin primeiro; depois patrocinadas; depois alfabética.
      if (a.sortOrder !== b.sortOrder) return b.sortOrder - a.sortOrder;
      if (a.promotedActive !== b.promotedActive) return a.promotedActive ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
});

export const getAllProductSlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
});

export const getAllBrandSlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.brand.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
});

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Normaliza os searchParams da URL nos filtros do catálogo. */
export function parseCatalogFilters(sp: RawSearchParams): CatalogFilters {
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const sortRaw = first(sp.sort);
  const sort: CatalogSort | undefined =
    sortRaw === "preco-desc" || sortRaw === "nome" || sortRaw === "preco-asc"
      ? sortRaw
      : undefined;
  return {
    material: first(sp.material),
    marca: first(sp.marca),
    cor: first(sp.cor),
    tech: first(sp.tech),
    sort,
  };
}
