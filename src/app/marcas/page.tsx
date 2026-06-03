import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Store } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { getBrandsOverview } from "@/lib/catalog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Marcas",
  description:
    "Conheça as marcas de filamentos e resinas para impressão 3D e compare preços entre lojas.",
  alternates: { canonical: "/marcas" },
  openGraph: {
    title: "Marcas",
    description:
      "Conheça as marcas de filamentos e resinas 3D e compare preços entre lojas.",
    url: "/marcas",
    type: "website",
  },
};

export default async function MarcasPage() {
  // Mostra TODAS as marcas, com ou sem oferta (na página da marca dá pra pedir ofertas).
  const brands = await getBrandsOverview();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageBanner placement="MARCAS" />
      <PageHeader
        icon={Store}
        eyebrow="Marcas"
        title="Marcas de filamento e resina"
        subtitle="Explore por marca e compare preços entre lojas."
      />

      {brands.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhuma marca cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/marca/${b.slug}`}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <BrandLogo name={b.name} logoUrl={b.logoUrl} size={44} />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{b.name}</span>
                  {b.promotedActive ? (
                    <Megaphone className="size-3.5 shrink-0 text-brand" />
                  ) : null}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {b.productCount > 0
                    ? `${b.productCount} ${b.productCount === 1 ? "produto" : "produtos"}`
                    : "Pedir ofertas →"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
