import { cache } from "react";

import { type ProductKind } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";

export type ReviewView = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: Date;
};

export type RatingSummary = { average: number | null; count: number };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function toView(r: {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: Date;
}): ReviewView {
  return {
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}

async function summaryFor(
  where: { productId: string } | { brandId: string },
): Promise<RatingSummary> {
  const agg = await prisma.review.aggregate({
    where: { ...where, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return {
    average: agg._avg.rating != null ? round1(agg._avg.rating) : null,
    count: agg._count._all,
  };
}

export const getProductReviews = cache(async (productId: string) => {
  const [reviews, summary] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    summaryFor({ productId }),
  ]);
  return { reviews: reviews.map(toView), summary };
});

export const getBrandReviews = cache(async (brandId: string) => {
  const [reviews, summary] = await Promise.all([
    prisma.review.findMany({
      where: { brandId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    summaryFor({ brandId }),
  ]);
  return { reviews: reviews.map(toView), summary };
});

export type RankingItem = {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  material: string;
  brandName: string;
  average: number;
  count: number;
};

export const getRanking = cache(
  async (material?: string): Promise<RankingItem[]> => {
    const groups = await prisma.review.groupBy({
      by: ["productId"],
      where: { status: "APPROVED", productId: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const ids = groups
      .map((g) => g.productId)
      .filter((x): x is string => x !== null);
    if (ids.length === 0) return [];

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { brand: { select: { name: true } } },
    });

    let items: RankingItem[] = products.map((p) => {
      const g = groups.find((x) => x.productId === p.id);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        kind: p.kind as ProductKind,
        material: p.material,
        brandName: p.brand.name,
        average: g?._avg.rating ?? 0,
        count: g?._count._all ?? 0,
      };
    });
    if (material) items = items.filter((it) => it.material === material);
    items.sort((a, b) => b.average - a.average || b.count - a.count);
    return items;
  },
);

export const getPendingReviews = cache(async () => {
  return prisma.review.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      product: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
  });
});
