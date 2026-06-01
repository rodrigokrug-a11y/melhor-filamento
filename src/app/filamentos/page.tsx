import type { Metadata } from "next";
import { Boxes } from "lucide-react";

import { CatalogView } from "@/components/catalog-view";
import { PageHeader } from "@/components/page-header";
import { getCatalog, parseCatalogFilters } from "@/lib/catalog";

const description =
  "Compare preços de filamentos para impressão 3D (PLA, PETG, ABS, TPU, ASA) entre várias lojas do Brasil.";

export const metadata: Metadata = {
  title: "Filamentos",
  description,
  alternates: { canonical: "/filamentos" },
  openGraph: {
    title: "Filamentos",
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        icon={Boxes}
        eyebrow="Catálogo"
        title="Filamentos"
        subtitle="Compare preços de filamentos 3D entre lojas. Informe seu CEP para ranquear pelo custo total com frete."
      />
      <CatalogView basePath="/filamentos" result={result} filters={filters} />
    </div>
  );
}
