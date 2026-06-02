import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";

import { OffersTable } from "@/components/offers-table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Loja", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function AdminLojaDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const seller = await prisma.seller.findUnique({
    where: { id },
    select: { id: true, name: true, website: true, isVerified: true },
  });
  if (!seller) notFound();

  const offers = await prisma.offer.findMany({
    where: { sellerId: id },
    include: {
      product: { select: { name: true } },
      seller: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const offerRows = offers.map((o) => ({
    id: o.id,
    productName: o.product.name,
    sellerName: o.seller.name,
    price: Number(o.price),
    status: o.status,
    isSponsored: o.isSponsored,
  }));

  return (
    <div>
      <Link
        href="/admin/lojas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Lojas
      </Link>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{seller.name}</h2>
          {seller.isVerified ? (
            <Badge variant="success" className="gap-1">
              <BadgeCheck className="size-3" />
              verificada
            </Badge>
          ) : null}
        </div>
        {seller.website ? (
          <a
            href={seller.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {seller.website}
          </a>
        ) : null}
      </div>

      <section>
        <h3 className="mb-1 font-semibold">Anúncios desta loja</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Edite preço/status/patrocínio na célula ou selecione vários para
          ações em massa e exclusão.
        </p>
        {offerRows.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum anúncio desta loja.
          </div>
        ) : (
          <OffersTable offers={offerRows} />
        )}
      </section>
    </div>
  );
}
