import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

import { CatalogView } from "@/components/catalog-view";
import { CatStrip } from "@/components/cat-strip";
import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { getCatalog, parseCatalogFilters } from "@/lib/catalog";
import { catalogJsonLd } from "@/lib/seo";

const description =
  "Compare preços de resinas para impressão 3D (Standard, Tough, laváveis em água) entre várias lojas do Brasil. Ordene pelo custo total com frete para o seu CEP.";

export const metadata: Metadata = {
  title: "Resinas 3D: comparar preços",
  description,
  alternates: { canonical: "/resinas" },
  openGraph: {
    title: "Resinas para impressão 3D — comparar preços",
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
    <>
      <CatStrip active="resinas" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageBanner placement="RESINAS" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: catalogJsonLd({
              name: "Resinas para impressão 3D",
              path: "/resinas",
              description,
              items: result.products.slice(0, 30),
            }),
          }}
        />
        <PageHeader
          icon={FlaskConical}
          eyebrow="Catálogo"
          title="Resinas para impressão 3D"
          subtitle="Compare preços de resinas 3D entre lojas. Informe seu CEP para ranquear pelo custo total com frete."
        />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Compare o preço de <strong>resinas para impressão 3D</strong> (LCD/MSLA)
          — Standard, Tough/ABS-like, laváveis em água e de alta resolução — entre
          várias lojas do Brasil. Informe seu CEP e ordenamos pelo{" "}
          <strong>custo total</strong> (preço + frete). Veja o preço por litro, o
          histórico de variação e as melhores ofertas para escolher a resina
          certa para a sua impressora de resina.
        </p>
        <CatalogView basePath="/resinas" result={result} filters={filters} />
      </div>
    </>
  );
}
