import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

import { CatalogView } from "@/components/catalog-view";
import { PageHeader } from "@/components/page-header";
import { getCatalog, parseCatalogFilters } from "@/lib/catalog";

const description =
  "Compare preços de resinas para impressão 3D (Standard, Tough, laváveis em água) entre várias lojas do Brasil.";

export const metadata: Metadata = {
  title: "Resinas",
  description,
  alternates: { canonical: "/resinas" },
  openGraph: {
    title: "Resinas",
    description,
    url: "/resinas",
    type: "website",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ResinasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseCatalogFilters(await searchParams);
  const result = await getCatalog("RESIN", filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        icon={FlaskConical}
        eyebrow="Catálogo"
        title="Resinas"
        subtitle="Compare preços de resinas 3D entre lojas. Informe seu CEP para ranquear pelo custo total com frete."
      />
      <CatalogView basePath="/resinas" result={result} filters={filters} />
    </div>
  );
}
