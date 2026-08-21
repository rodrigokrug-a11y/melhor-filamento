import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Megaphone, Store } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { CatalogGrid } from "@/components/catalog-grid";
import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { getBrandsOverview, getCatalog } from "@/lib/catalog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Marcas de filamento e resina 3D",
  description:
    "Conheça as marcas de filamentos e resinas para impressão 3D e compare preços entre lojas do Brasil.",
  alternates: { canonical: "/marca" },
  openGraph: {
    title: "Marcas de filamento e resina 3D",
    description:
      "Conheça as marcas de filamentos e resinas 3D e compare preços entre lojas.",
    url: "/marca",
    type: "website",
  },
};

export default async function MarcaPage() {
  // Mostra TODAS as marcas, com ou sem oferta (na página da marca dá pra pedir ofertas).
  const [brands, filamentos, resinas] = await Promise.all([
    getBrandsOverview(),
    getCatalog("FILAMENT", { sort: "preco-asc" }),
    getCatalog("RESIN", { sort: "preco-asc" }),
  ]);

  // Anúncios reais logo abaixo das marcas: quem entra aqui está garimpando
  // preço, então a página não termina numa lista de logotipos.
  const listings = [
    ...filamentos.products.slice(0, 8),
    ...resinas.products.slice(0, 4),
  ].sort((a, b) => a.bestPrice - b.bestPrice);

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

      {listings.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              Ofertas das marcas
            </h2>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>
          <CatalogGrid products={listings} sort="preco-asc" />
        </section>
      ) : null}
    </div>
  );
}
