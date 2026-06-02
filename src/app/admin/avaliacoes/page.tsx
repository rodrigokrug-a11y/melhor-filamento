import type { Metadata } from "next";

import { AdminReviewList } from "@/components/admin-review-list";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Avaliações",
  robots: { index: false },
};

const ORDER: Record<string, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };

export default async function AvaliacoesPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      product: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });

  const rows = reviews
    .map((r) => ({
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
    }))
    .sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));

  const pending = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <h2 className="text-lg font-semibold">Moderação de avaliações</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {pending > 0 ? `${pending} pendente(s) no topo. ` : ""}
        Aprove, rejeite ou apague qualquer avaliação. As publicadas entram no
        ranking e nas páginas.
      </p>
      <AdminReviewList reviews={rows} />
    </div>
  );
}
