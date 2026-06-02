import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminReviewList } from "@/components/admin-review-list";
import { BrandLogo } from "@/components/brand-logo";
import { OffersTable } from "@/components/offers-table";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Marca", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function AdminMarcaDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  if (!brand) notFound();

  const [offers, reviews] = await Promise.all([
    prisma.offer.findMany({
      where: { product: { brandId: id } },
      include: {
        product: { select: { name: true } },
        seller: { select: { name: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.review.findMany({
      where: { OR: [{ brandId: id }, { product: { brandId: id } }] },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
  ]);

  const offerRows = offers.map((o) => ({
    id: o.id,
    productName: o.product.name,
    sellerName: o.seller.name,
    price: Number(o.price),
    status: o.status,
    isSponsored: o.isSponsored,
  }));

  const reviewRows = reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    status: r.status,
    context: r.product
      ? `Modelo: ${r.product.name}`
      : r.brand
        ? `Marca: ${r.brand.name}`
        : "",
  }));

  return (
    <div>
      <Link
        href="/admin/marcas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Marcas
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size={48} />
        <div>
          <h2 className="text-lg font-semibold">{brand.name}</h2>
          <Link
            href={`/marca/${brand.slug}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ver página pública →
          </Link>
        </div>
      </div>

      <section className="mb-10">
        <h3 className="mb-1 font-semibold">Anúncios desta marca</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Edite preço/status/patrocínio na célula ou selecione vários para
          ações em massa e exclusão.
        </p>
        {offerRows.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum anúncio desta marca.
          </div>
        ) : (
          <OffersTable offers={offerRows} />
        )}
      </section>

      <section>
        <h3 className="mb-1 font-semibold">Avaliações desta marca</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Inclui avaliações da marca e dos seus produtos. Aprove, rejeite ou
          apague.
        </p>
        <AdminReviewList reviews={reviewRows} />
      </section>
    </div>
  );
}
