import Link from "next/link";
import { Check, SlidersHorizontal } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { CatalogGrid } from "@/components/catalog-grid";
import { RegionNotice } from "@/components/region-notice";
import { SortSelect } from "@/components/sort-select";
import type {
  CatalogFilters,
  CatalogResult,
  CatalogSort,
} from "@/lib/catalog-types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-kg", label: "Menor preço/kg" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
];

function buildHref(
  basePath: string,
  current: CatalogFilters,
  patch: Partial<CatalogFilters>,
): string {
  const next = { ...current, ...patch };
  const sp = new URLSearchParams();
  if (next.materials?.length) sp.set("material", next.materials.join(","));
  if (next.marcas?.length) sp.set("marca", next.marcas.join(","));
  if (next.cores?.length) sp.set("cor", next.cores.join(","));
  if (next.tech) sp.set("tech", next.tech);
  if (next.faixa) sp.set("faixa", next.faixa);
  if (next.sort && next.sort !== "preco-asc") sp.set("sort", next.sort);
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function toggle(arr: string[] | undefined, val: string): string[] | undefined {
  const set = new Set(arr ?? []);
  if (set.has(val)) set.delete(val);
  else set.add(val);
  const out = [...set];
  return out.length ? out : undefined;
}

function activeCount(f: CatalogFilters): number {
  return (
    (f.materials?.length ?? 0) +
    (f.marcas?.length ?? 0) +
    (f.cores?.length ?? 0) +
    (f.tech ? 1 : 0) +
    (f.faixa ? 1 : 0)
  );
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
  const { products } = result;
  const active = activeCount(filters);
  const activeSort = filters.sort ?? "preco-asc";
  const sortOptions = SORT_OPTIONS.map((s) => ({
    value: s.value,
    label: s.label,
    href: buildHref(basePath, filters, { sort: s.value }),
  }));

  return (
    <div>
      {/* Filtros mobile (colapsável, sem JS) */}
      <details className="group mb-4 rounded-2xl border bg-card lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-brand" />
            Filtros{active > 0 ? ` (${active})` : ""}
          </span>
          <span className="text-xs font-medium text-muted-foreground group-open:hidden">
            abrir
          </span>
        </summary>
        <div className="border-t p-4">
          <FiltersPanel basePath={basePath} result={result} filters={filters} />
        </div>
      </details>

      <div className="grid gap-7 lg:grid-cols-[248px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <FiltersPanel
              basePath={basePath}
              result={result}
              filters={filters}
            />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <b className="text-foreground tnum">{products.length}</b>{" "}
              {products.length === 1 ? "produto" : "produtos"}
            </p>
            <SortSelect value={activeSort} options={sortOptions} />
          </div>
          <div className="mb-4">
            <RegionNotice />
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              Nenhum produto encontrado com esses filtros.{" "}
              <Link
                href={basePath}
                className="font-medium text-brand hover:underline"
              >
                Limpar filtros
              </Link>
            </div>
          ) : (
            <CatalogGrid products={products} sort={activeSort} />
          )}
        </div>
      </div>
    </div>
  );
}

function FiltersPanel({
  basePath,
  result,
  filters,
}: {
  basePath: string;
  result: CatalogResult;
  filters: CatalogFilters;
}) {
  const { materials, brands, colors, techs, priceBands } = result;
  const active = activeCount(filters);

  return (
    <div>
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-display text-base font-bold">Filtros</h2>
        {active > 0 ? (
          <Link
            href={basePath}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Limpar
          </Link>
        ) : null}
      </div>

      {techs.length > 1 ? (
        <FilterGroup title="Tecnologia">
          {techs.map((t) => (
            <CheckRow
              key={t.value}
              radio
              href={buildHref(basePath, filters, {
                tech: filters.tech === t.value ? undefined : t.value,
              })}
              checked={filters.tech === t.value}
              label={t.label}
              count={t.count}
            />
          ))}
        </FilterGroup>
      ) : null}

      {materials.length > 1 ? (
        <FilterGroup title="Material">
          {materials.map((m) => (
            <CheckRow
              key={m.value}
              href={buildHref(basePath, filters, {
                materials: toggle(filters.materials, m.value),
              })}
              checked={filters.materials?.includes(m.value) ?? false}
              label={m.label}
              count={m.count}
            />
          ))}
        </FilterGroup>
      ) : null}

      {priceBands.length > 1 ? (
        <FilterGroup title="Faixa de preço">
          {priceBands.map((b) => (
            <CheckRow
              key={b.id}
              radio
              href={buildHref(basePath, filters, {
                faixa: filters.faixa === b.id ? undefined : b.id,
              })}
              checked={filters.faixa === b.id}
              label={b.label}
              count={b.count}
            />
          ))}
        </FilterGroup>
      ) : null}

      {brands.length > 1 ? (
        <FilterGroup title="Marca" scroll>
          {brands.map((b) => (
            <CheckRow
              key={b.value}
              href={buildHref(basePath, filters, {
                marcas: toggle(filters.marcas, b.value),
              })}
              checked={filters.marcas?.includes(b.value) ?? false}
              label={b.label}
              count={b.count}
              logoUrl={b.logoUrl}
            />
          ))}
        </FilterGroup>
      ) : null}

      {colors.length > 1 ? (
        <FilterGroup title="Cor" scroll>
          {colors.map((c) => (
            <CheckRow
              key={c.value}
              href={buildHref(basePath, filters, {
                cores: toggle(filters.cores, c.value),
              })}
              checked={filters.cores?.includes(c.value) ?? false}
              label={c.label}
              count={c.count}
            />
          ))}
        </FilterGroup>
      ) : null}
    </div>
  );
}

function FilterGroup({
  title,
  scroll,
  children,
}: {
  title: string;
  scroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t py-3">
      <h3 className="mb-1.5 font-display text-sm font-semibold">{title}</h3>
      <div
        className={cn(
          "space-y-0.5",
          scroll && "max-h-56 overflow-y-auto pr-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function CheckRow({
  href,
  checked,
  label,
  count,
  logoUrl,
  radio,
}: {
  href: string;
  checked: boolean;
  label: string;
  count: number;
  logoUrl?: string | null;
  radio?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border-[1.5px] transition-colors",
          radio ? "rounded-full" : "rounded",
          checked ? "border-brand bg-brand text-white" : "border-input",
        )}
      >
        {checked ? (
          radio ? (
            <span className="size-1.5 rounded-full bg-white" />
          ) : (
            <Check className="size-3" />
          )
        ) : null}
      </span>
      {logoUrl ? (
        <BrandLogo name={label} logoUrl={logoUrl} size={16} />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {count}
      </span>
    </Link>
  );
}
