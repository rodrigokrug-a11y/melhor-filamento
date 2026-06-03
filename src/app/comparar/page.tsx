import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";

import { CompareView } from "@/components/compare-view";
import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { getComparableProducts } from "@/lib/catalog";
import { type ProductKind } from "@/lib/catalog-types";
import { getMaterialsOverview } from "@/lib/tips";
import { cn } from "@/lib/utils";

// ISR: dados de catálogo/dicas revalidam a cada hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Comparar — filamentos, resinas e impressoras 3D",
  description:
    "Compare filamentos, resinas e impressoras 3D lado a lado: preço com frete, prazo e especificações. Veja o melhor negócio para o seu CEP.",
  alternates: { canonical: "/comparar" },
  openGraph: {
    title: "Comparar — filamentos, resinas e impressoras 3D",
    description:
      "Compare lado a lado preço, frete e especificações e veja o melhor negócio para o seu CEP.",
    url: "/comparar",
    type: "website",
  },
};

const TABS: { tipo: string; kind: ProductKind; label: string }[] = [
  { tipo: "filamento", kind: "FILAMENT", label: "Filamentos" },
  { tipo: "resina", kind: "RESIN", label: "Resinas" },
  { tipo: "impressora", kind: "PRINTER", label: "Impressoras 3D" },
];

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CompararPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tipoRaw = typeof sp.tipo === "string" ? sp.tipo : "filamento";
  const tab = TABS.find((t) => t.tipo === tipoRaw) ?? TABS[0];

  const pRaw = sp.p;
  const initialSlugs = (
    typeof pRaw === "string" ? pRaw.split(",") : Array.isArray(pRaw) ? pRaw : []
  )
    .map((s) => s.trim())
    .filter(Boolean);

  const [products, materials] = await Promise.all([
    getComparableProducts(tab.kind),
    getMaterialsOverview(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageBanner placement="COMPARAR" />
      <PageHeader
        icon={Scale}
        eyebrow="Comparador ao vivo"
        title="Comparar"
        subtitle="Escolha os itens e veja preço, frete e especificações lado a lado — o melhor negócio na hora."
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border bg-card p-1">
        {TABS.map((t) => (
          <Link
            key={t.tipo}
            href={`/comparar?tipo=${t.tipo}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              t.tipo === tab.tipo
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Ainda não há {tab.label.toLowerCase()} com ofertas para comparar.
        </div>
      ) : (
        <CompareView
          products={products}
          materials={materials}
          initialSlugs={initialSlugs}
          kind={tab.kind}
        />
      )}
    </div>
  );
}
