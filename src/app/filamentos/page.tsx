import type { Metadata } from "next";
import { Boxes } from "lucide-react";

import { CatalogView } from "@/components/catalog-view";
import { CatStrip } from "@/components/cat-strip";
import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { getCatalog, parseCatalogFilters } from "@/lib/catalog";
import { catalogJsonLd } from "@/lib/seo";

const description =
  "Compare preços de filamentos para impressão 3D (PLA, PETG, ABS, TPU, ASA) entre várias lojas do Brasil. Ordene pelo custo total com frete para o seu CEP.";

export const metadata: Metadata = {
  title: "Filamentos 3D: comparar preços",
  description,
  alternates: { canonical: "/filamentos" },
  openGraph: {
    title: "Filamentos para impressão 3D — comparar preços",
    description,
    url: "/filamentos",
    type: "website",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function FilamentosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseCatalogFilters(await searchParams);
  const result = await getCatalog("FILAMENT", filters);
  const active =
    filters.materials?.length === 1 ? filters.materials[0] : "tudo";

  return (
    <>
      <CatStrip active={active} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageBanner placement="FILAMENTOS" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: catalogJsonLd({
              name: "Filamentos para impressão 3D",
              path: "/filamentos",
              description,
              items: result.products.slice(0, 30),
            }),
          }}
        />
      <PageHeader
        icon={Boxes}
        eyebrow="Catálogo"
        title="Filamentos para impressão 3D"
        subtitle="Compare preços de filamentos 3D entre lojas. Informe seu CEP para ranquear pelo custo total com frete."
      />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          No Melhor Filamento você compara o preço de filamentos para impressão
          3D — <strong>PLA, PETG, ABS, ASA, TPU</strong> e mais — entre várias
          lojas do Brasil em um só lugar. Informe seu CEP e ordenamos pelo{" "}
          <strong>custo total</strong> (preço + frete), não só pela etiqueta.
          Veja o <strong>preço por quilo</strong>, o histórico de variação e as
          melhores ofertas do dia para escolher o filamento certo sem pagar a
          mais.
        </p>
        <CatalogView basePath="/filamentos" result={result} filters={filters} />
      </div>
    </>
  );
}
