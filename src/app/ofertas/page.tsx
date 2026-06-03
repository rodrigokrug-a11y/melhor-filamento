import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { getDeals } from "@/lib/catalog";

const description =
  "As maiores quedas de preço e descontos em filamentos, resinas e impressoras 3D no Brasil.";

export const metadata: Metadata = {
  title: "Ofertas do dia",
  description,
  alternates: { canonical: "/ofertas" },
  openGraph: {
    title: "Ofertas do dia — Melhor Filamento",
    description,
    url: "/ofertas",
    type: "website",
  },
};

export const revalidate = 1800;

export default async function OfertasPage() {
  const deals = await getDeals(36);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageBanner placement="GLOBAL" />
      <PageHeader
        icon={Flame}
        eyebrow="Promoções"
        title="Ofertas do dia"
        subtitle="Os maiores descontos do momento — produtos cuja melhor oferta está com preço abaixo do normal."
      />

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhuma oferta com desconto no momento. Veja{" "}
          <Link
            href="/filamentos"
            className="font-medium text-brand hover:underline"
          >
            todos os filamentos
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
