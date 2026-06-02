import type { Metadata } from "next";
import { Printer } from "lucide-react";

import { CatalogView } from "@/components/catalog-view";
import { PageHeader } from "@/components/page-header";
import { getCatalog, parseCatalogFilters } from "@/lib/catalog";

const description =
  "Compare preços de impressoras 3D (FDM e resina) entre lojas do Brasil — por marca, tecnologia e custo total com frete.";

export const metadata: Metadata = {
  title: "Impressoras 3D",
  description,
  alternates: { canonical: "/impressoras" },
  openGraph: {
    title: "Impressoras 3D",
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        icon={Printer}
        eyebrow="Catálogo"
        title="Impressoras 3D"
        subtitle="Compare impressoras 3D (FDM e resina) entre lojas. Informe seu CEP para ranquear pelo custo total com frete."
      />
      <CatalogView basePath="/impressoras" result={result} filters={filters} />
    </div>
  );
}
