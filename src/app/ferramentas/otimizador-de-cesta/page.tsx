import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBasket } from "lucide-react";

import {
  CartOptimizer,
  type CartProduct,
} from "@/components/tools/cart-optimizer";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/db";
import { type CouponType, effectivePrice } from "@/lib/pricing";

const description =
  "Monte sua lista de compras de filamentos e resinas e descubra a combinação de lojas mais barata, contando o frete — comprar em menos lojas costuma economizar.";

export const metadata: Metadata = {
  title: "Otimizador de cesta — onde comprar mais barato",
  description,
  alternates: { canonical: "/ferramentas/otimizador-de-cesta" },
  openGraph: {
    title: "Otimizador de cesta de impressão 3D",
    description,
    url: "/ferramentas/otimizador-de-cesta",
    type: "website",
  },
};

export default async function Page() {
  const rows = await prisma.product.findMany({
    where: {
      kind: { in: ["FILAMENT", "RESIN"] },
      offers: { some: { status: "APPROVED", stockStatus: { not: "OUT_OF_STOCK" } } },
    },
    select: {
      id: true,
      name: true,
      brand: { select: { name: true } },
      offers: {
        where: { status: "APPROVED", stockStatus: { not: "OUT_OF_STOCK" } },
        select: {
          price: true,
          couponType: true,
          couponDiscount: true,
          seller: { select: { name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const products: CartProduct[] = rows
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand.name,
      offers: p.offers
        .map((o) => ({
          store: o.seller.name,
          price: effectivePrice({
            price: Number(o.price),
            couponType: o.couponType as CouponType | null,
            couponDiscount:
              o.couponDiscount != null ? Number(o.couponDiscount) : null,
          }),
        }))
        .filter((o) => o.price > 0)
        .sort((a, b) => a.price - b.price),
    }))
    .filter((p) => p.offers.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/ferramentas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Ferramentas
      </Link>
      <PageHeader
        icon={ShoppingBasket}
        eyebrow="Ferramenta"
        title="Otimizador de cesta"
        subtitle="Monte sua lista de compras e veja a combinação de lojas mais barata, contando o frete — juntar tudo numa loja só costuma compensar."
      />
      <CartOptimizer products={products} />
    </div>
  );
}
