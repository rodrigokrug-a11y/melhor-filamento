import type { Metadata } from "next";
import { Printer } from "lucide-react";

import { CatalogView } from "@/components/catalog-view";
import { CatStrip } from "@/components/cat-strip";
import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { getCatalog, parseCatalogFilters } from "@/lib/catalog";
import { catalogJsonLd } from "@/lib/seo";

const description =
  "Compare preços de impressoras 3D (FDM e resina) entre lojas do Brasil — por marca, tecnologia e custo total com frete para o seu CEP.";

export const metadata: Metadata = {
  title: "Impressoras 3D: comparar preços",
  description,
  alternates: { canonical: "/impressoras" },
  openGraph: {
    title: "Impressoras 3D — comparar preços no Brasil",
    description,
    url: "/impressoras",
    type: "website",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ImpressorasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseCatalogFilters(await searchParams);
  const result = await getCatalog("PRINTER", filters);

  return (
    <>
      <CatStrip active="impressoras" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageBanner placement="IMPRESSORAS" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: catalogJsonLd({
              name: "Impressoras 3D",
              path: "/impressoras",
              description,
              items: result.products.slice(0, 30),
            }),
          }}
        />
        <PageHeader
          icon={Printer}
          eyebrow="Catálogo"
          title="Impressoras 3D"
          subtitle="Compare impressoras 3D (FDM e resina) entre lojas. Informe seu CEP para ranquear pelo custo total com frete."
        />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Compare preços de <strong>impressoras 3D</strong> no Brasil — modelos{" "}
          <strong>FDM</strong> (filamento) e de <strong>resina</strong> (LCD/MSLA)
          — por marca, tecnologia e tamanho de mesa. Informe seu CEP e ordenamos
          pelo <strong>custo total</strong> (preço + frete) para você achar a
          impressora certa para começar ou evoluir, sem pagar a mais.
        </p>
        <CatalogView basePath="/impressoras" result={result} filters={filters} />
      </div>
    </>
  );
}
