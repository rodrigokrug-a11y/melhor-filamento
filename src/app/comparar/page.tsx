import type { Metadata } from "next";
import { Scale } from "lucide-react";

import { CompareView } from "@/components/compare-view";
import { PageHeader } from "@/components/page-header";
import { getComparableProducts } from "@/lib/catalog";
import { getMaterialsOverview } from "@/lib/tips";

// ISR: dados de catálogo/dicas revalidam a cada hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Comparar filamentos — preço, frete e prazo",
  description:
    "Compare filamentos 3D lado a lado com controles ao vivo: faixa de preço, frete grátis e lojas verificadas. Veja o menor total para o seu CEP.",
  alternates: { canonical: "/comparar" },
  openGraph: {
    title: "Comparar filamentos — preço, frete e prazo",
    description:
      "Compare filamentos 3D lado a lado com controles ao vivo e veja o menor total para o seu CEP.",
    url: "/comparar",
    type: "website",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CompararPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pRaw = sp.p;
  const initialSlugs = (
    typeof pRaw === "string" ? pRaw.split(",") : Array.isArray(pRaw) ? pRaw : []
  )
    .map((s) => s.trim())
    .filter(Boolean);

  const [products, materials] = await Promise.all([
    getComparableProducts("FILAMENT"),
    getMaterialsOverview(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        icon={Scale}
        eyebrow="Comparador ao vivo"
        title="Comparar filamentos"
        subtitle="Escolha os produtos e ajuste os filtros — preço, frete e lojas — para ver o melhor negócio na hora."
      />

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Ainda não há filamentos com ofertas para comparar.
        </div>
      ) : (
        <CompareView
          products={products}
          materials={materials}
          initialSlugs={initialSlugs}
        />
      )}
    </div>
  );
}
