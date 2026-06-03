import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { searchProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Busca",
  description:
    "Busque filamentos, resinas e impressoras 3D por nome, marca ou cor e compare preços.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/busca" },
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length >= 2 ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        icon={Search}
        eyebrow="Busca"
        title={query ? `Resultados para “${query}”` : "Buscar no catálogo"}
        subtitle={
          query
            ? `${results.length} ${
                results.length === 1
                  ? "produto encontrado"
                  : "produtos encontrados"
              } com oferta ativa.`
            : "Encontre filamentos, resinas e impressoras por nome, marca ou cor."
        }
      />

      <div className="mb-8 max-w-xl">
        <SearchBox size="lg" defaultValue={query} autoFocus={!query} />
      </div>

      {!query || query.length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Digite ao menos 2 caracteres para buscar.
        </p>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhum produto encontrado para “{query}”. Tente outro termo ou veja{" "}
          <Link
            href="/filamentos"
            className="font-medium text-brand hover:underline"
          >
            todos os filamentos
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
