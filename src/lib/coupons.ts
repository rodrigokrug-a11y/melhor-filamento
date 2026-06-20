import { cache } from "react";

import { prisma } from "@/lib/db";

export type ProductSeller = { id: string; name: string };

export type CouponView = {
  id: string;
  code: string;
  description: string | null;
  sellerName: string;
  expiresAt: Date | null;
};

/** Lojas (Seller) com oferta aprovada no produto — para o seletor do cupom. */
export const getSellersForProduct = cache(
  async (productId: string): Promise<ProductSeller[]> => {
    const rows = await prisma.offer.findMany({
      where: { productId, status: "APPROVED" },
      select: { seller: { select: { id: true, name: true } } },
      distinct: ["sellerId"],
      orderBy: { seller: { name: "asc" } },
    });
    return rows.map((r) => r.seller);
  },
);

/** Cupons APROVADOS das lojas que vendem o produto (não expirados). */
export const getApprovedCouponsForProduct = cache(
  async (productId: string): Promise<CouponView[]> => {
    const sellers = await getSellersForProduct(productId);
    if (sellers.length === 0) return [];
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        sellerId: { in: sellers.map((s) => s.id) },
        status: "APPROVED",
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        description: true,
        expiresAt: true,
        seller: { select: { name: true } },
      },
    });
    return coupons.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      sellerName: c.seller.name,
      expiresAt: c.expiresAt,
    }));
  },
);

/** Fila de moderação: cupons pendentes (mais antigos primeiro). */
export async function getPendingCoupons() {
  return prisma.coupon.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      code: true,
      description: true,
      expiresAt: true,
      submittedByName: true,
      createdAt: true,
      seller: { select: { name: true } },
      submittedBy: { select: { email: true } },
    },
  });
}
