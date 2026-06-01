import type { Metadata } from "next";

import { OffersTable } from "@/components/offers-table";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Anúncios",
  robots: { index: false },
};

export default async function AnunciosPage() {
  const offers = await prisma.offer.findMany({
    include: {
      product: { select: { name: true } },
      seller: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 1000,
  });

  const rows = offers.map((o) => ({
    id: o.id,
    productName: o.product.name,
    sellerName: o.seller.name,
    price: Number(o.price),
    status: o.status,
    isSponsored: o.isSponsored,
  }));

  return (
    <div>
      <h2 className="text-lg font-semibold">Anúncios (ofertas)</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Visão de planilha. Selecione vários e mude <strong>status</strong>{" "}
        (visível/oculto) ou <strong>patrocínio</strong> em massa. Edite o{" "}
        <strong>preço</strong> direto na célula (Enter ou clique fora para salvar).
      </p>
      <OffersTable offers={rows} />
    </div>
  );
}
