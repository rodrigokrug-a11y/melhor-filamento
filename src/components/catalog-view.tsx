import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { CatalogGrid } from "@/components/catalog-grid";
import { RegionNotice } from "@/components/region-notice";
import type {
  CatalogFilters,
  CatalogResult,
  CatalogSort,
} from "@/lib/catalog-types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "nome", label: "Nome" },
];

function buildHref(
  basePath: string,
  current: CatalogFilters,
  patch: Partial<CatalogFilters>,
): string {
  const next = { ...current, ...patch };
  const sp = new URLSearchParams();
  if (next.material) sp.set("material", next.material);
  if (next.marca) sp.set("marca", next.marca);
  if (next.cor) sp.set("cor", next.cor);
  if (next.sort && next.sort !== "preco-asc") sp.set("sort", next.sort);
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CatalogView({
  basePath,
  result,
  filters,
}: {
  basePath: string;
  result: CatalogResult;
  filters: CatalogFilters;
}) {
  const { products, materials, brands, colors } = result;
  const activeSort = filters.sort ?? "preco-asc";

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
        {materials.length > 1 ? (
          <FilterRow label="Material">
            <Chip
              href={buildHref(basePath, filters, { material: undefined })}
              active={!filters.material}
            >
              Todos
            </Chip>
            {materials.map((m) => (
              <Chip
                key={m.value}
                href={buildHref(basePath, filters, { material: m.value })}
                active={filters.material === m.value}
              >
                {m.label}{" "}
                <span className="font-normal opacity-60">({m.count})</span>
              </Chip>
            ))}
          </FilterRow>
        ) : null}

        {brands.length > 1 ? (
          <FilterRow label="Marca">
            <Chip
              href={buildHref(basePath, filters, { marca: undefined })}
              active={!filters.marca}
            >
              Todas
            </Chip>
            {brands.map((b) => (
              <Chip
                key={b.value}
                href={buildHref(basePath, filters, { marca: b.value })}
                active={filters.marca === b.value}
              >
                {b.logoUrl ? (
                  <BrandLogo name={b.label} logoUrl={b.logoUrl} size={16} />
                ) : null}
                {b.label}{" "}
                <span className="font-normal opacity-60">({b.count})</span>
              </Chip>
            ))}
          </FilterRow>
        ) : null}

        {colors.length > 1 ? (
          <FilterRow label="Cor">
            <Chip
              href={buildHref(basePath, filters, { cor: undefined })}
              active={!filters.cor}
            >
              Todas
            </Chip>
            {colors.map((c) => (
              <Chip
                key={c.value}
                href={buildHref(basePath, filters, { cor: c.value })}
                active={filters.cor === c.value}
              >
                {c.label}{" "}
                <span className="font-normal opacity-60">({c.count})</span>
              </Chip>
            ))}
          </FilterRow>
        ) : null}

        <FilterRow label="Ordenar">
          {SORT_OPTIONS.map((s) => (
            <Chip
              key={s.value}
              href={buildHref(basePath, filters, { sort: s.value })}
              active={activeSort === s.value}
            >
              {s.label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
        <RegionNotice />
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhum produto encontrado com esses filtros.
        </div>
      ) : (
        <CatalogGrid products={products} sort={filters.sort ?? "preco-asc"} />
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-brand text-brand-foreground shadow-sm shadow-brand/20"
          : "bg-background hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </Link>
  );
}
