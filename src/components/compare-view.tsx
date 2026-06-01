"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Lightbulb,
  Megaphone,
  Tag,
  Truck,
} from "lucide-react";

import { OfferLink } from "@/components/offer-link";
import { RegionNotice } from "@/components/region-notice";
import { VerifiedOfferSeal, VerifiedStoreSeal } from "@/components/seals";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/components/use-region";
import {
  type CompareProduct,
  type OfferView,
  MATERIAL_INFO,
  materialLabel,
} from "@/lib/catalog-types";
import {
  type ShippingEstimate,
  estimateShipping,
  totalForRegion,
} from "@/lib/shipping";
import { cn, formatBRL } from "@/lib/utils";

type MaterialOverview = { material: string; tipCount: number };

type SortKey = "total" | "preco" | "prazo" | "nome";

type ComputedOffer = OfferView & {
  shipping: ShippingEstimate | null;
  value: number; // valor exibido: total com frete (com CEP) ou preço efetivo
  days: number | null;
  free: boolean;
};

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function shippingLabel(o: ComputedOffer): string {
  if (!o.shipping) return "frete a calcular";
  const dias =
    o.shipping.estimatedDays === 1
      ? "1 dia útil"
      : `${o.shipping.estimatedDays} dias úteis`;
  return o.free
    ? `frete grátis · ${dias}`
    : `frete ${formatBRL(o.shipping.cost)} · ${dias}`;
}

export function CompareView({
  products,
  materials,
  initialSlugs,
}: {
  products: CompareProduct[];
  materials: MaterialOverview[];
  initialSlugs: string[];
}) {
  const { region } = useRegion();
  const uf = region?.uf ?? null;

  const initialSelected = useMemo(() => {
    const set = new Set<string>();
    if (initialSlugs.length) {
      for (const p of products)
        if (initialSlugs.includes(p.slug)) set.add(p.id);
    }
    if (set.size === 0) for (const p of products) set.add(p.id);
    return set;
  }, [products, initialSlugs]);

  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const [sort, setSort] = useState<SortKey>("total");
  const [freeOnly, setFreeOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Teto do slider: maior valor exibido entre TODAS as ofertas (estável).
  const priceBound = useMemo(() => {
    let max = 0;
    for (const p of products) {
      for (const o of p.offers) {
        const v = uf
          ? totalForRegion(
              o.effectivePrice,
              estimateShipping(o.shippingRules, uf, o.effectivePrice),
            )
          : o.effectivePrice;
        if (v > max) max = v;
      }
    }
    return Math.ceil(max);
  }, [products, uf]);

  const rows = useMemo(() => {
    const cap = maxPrice ?? Infinity;
    const result = products
      .filter((p) => selected.has(p.id))
      .map((p) => {
        const computed: ComputedOffer[] = p.offers.map((o) => {
          const shipping = uf
            ? estimateShipping(o.shippingRules, uf, o.effectivePrice)
            : null;
          const value = uf
            ? totalForRegion(o.effectivePrice, shipping)
            : o.effectivePrice;
          return {
            ...o,
            shipping,
            value,
            days: shipping?.estimatedDays ?? null,
            free: shipping?.free ?? false,
          };
        });
        const qualifying = computed.filter((o) => {
          if (verifiedOnly && !o.sellerVerified) return false;
          if (freeOnly && !o.free) return false;
          if (o.value > cap) return false;
          return true;
        });
        qualifying.sort((a, b) => a.value - b.value);
        return {
          product: p,
          best: qualifying[0] ?? null,
          qualifyingCount: qualifying.length,
          totalCount: p.offers.length,
        };
      });

    result.sort((a, b) => {
      if (!!a.best !== !!b.best) return a.best ? -1 : 1;
      if (!a.best || !b.best)
        return a.product.name.localeCompare(b.product.name, "pt-BR");
      switch (sort) {
        case "preco":
          return a.best.effectivePrice - b.best.effectivePrice;
        case "prazo": {
          const ad = a.best.days ?? Infinity;
          const bd = b.best.days ?? Infinity;
          return ad !== bd ? ad - bd : a.best.value - b.best.value;
        }
        case "nome":
          return a.product.name.localeCompare(b.product.name, "pt-BR");
        case "total":
        default:
          return a.best.value - b.best.value;
      }
    });
    return result;
  }, [products, selected, uf, freeOnly, verifiedOnly, maxPrice, sort]);

  const bestValue = useMemo(
    () =>
      rows.reduce(
        (min, r) => (r.best && r.best.value < min ? r.best.value : min),
        Infinity,
      ),
    [rows],
  );

  const dicaMaterials = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (selected.has(p.id)) set.add(p.material);
    return [...set]
      .filter((m) => MATERIAL_INFO[m])
      .map((m) => ({
        material: m,
        tipCount: materials.find((x) => x.material === m)?.tipCount ?? 0,
      }))
      .sort((a, b) =>
        materialLabel(a.material).localeCompare(materialLabel(b.material), "pt-BR"),
      );
  }, [products, selected, materials]);

  const qualifyingProducts = rows.filter((r) => r.best).length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Seletor de produtos */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Produtos ({selected.size}/{products.length})
          </p>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setSelected(new Set(products.map((p) => p.id)))}
            >
              Todos
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:underline"
              onClick={() => setSelected(new Set())}
            >
              Limpar
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => {
            const on = selected.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  on
                    ? "border-primary bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controles ao vivo */}
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <RegionNotice />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-muted-foreground">
            Ordenar por
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={selectClass}
            >
              <option value="total">Menor total (com frete)</option>
              <option value="preco">Menor preço</option>
              <option value="prazo">Menor prazo</option>
              <option value="nome">Nome</option>
            </select>
          </label>
          {priceBound > 0 ? (
            <label className="block text-xs font-medium text-muted-foreground">
              Preço até{" "}
              <span className="text-foreground">
                {formatBRL(maxPrice ?? priceBound)}
              </span>
              {maxPrice == null ? " (sem limite)" : ""}
              <input
                type="range"
                min={0}
                max={priceBound}
                step={1}
                value={maxPrice ?? priceBound}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaxPrice(v >= priceBound ? null : v);
                }}
                className="mt-3 w-full accent-primary"
                aria-label="Preço máximo"
              />
            </label>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <ToggleChip
            active={verifiedOnly}
            onClick={() => setVerifiedOnly((v) => !v)}
            icon={BadgeCheck}
            label="Só lojas verificadas"
          />
          <ToggleChip
            active={freeOnly}
            disabled={!uf}
            onClick={() => setFreeOnly((v) => !v)}
            icon={Truck}
            label="Só frete grátis"
            hint={!uf ? "Informe seu CEP acima" : undefined}
          />
        </div>
      </div>

      {/* Resultado da comparação */}
      {selected.size === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Selecione ao menos um produto para comparar.
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Comparando {selected.size}{" "}
            {selected.size === 1 ? "produto" : "produtos"} ·{" "}
            {qualifyingProducts} com oferta nos filtros.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ product, best, qualifyingCount, totalCount }) => {
              const isCheapest =
                best != null && best.value === bestValue && bestValue !== Infinity;
              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-4",
                    isCheapest && "border-emerald-500/60 ring-1 ring-emerald-500/20",
                    !best && "opacity-70",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/produto/${product.slug}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {product.brandName} · {materialLabel(product.material)} ·{" "}
                        {product.netWeightG} g
                      </p>
                    </div>
                    {isCheapest ? (
                      <Badge variant="success" className="shrink-0">
                        {uf ? "Menor total" : "Menor preço"}
                      </Badge>
                    ) : null}
                  </div>

                  {best ? (
                    <div className="mt-3 flex flex-1 flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          {formatBRL(best.value)}
                        </span>
                        {uf ? (
                          <span className="text-xs text-muted-foreground">
                            total
                          </span>
                        ) : null}
                      </div>
                      {uf ? (
                        <p className="text-xs text-muted-foreground">
                          produto {formatBRL(best.effectivePrice)} ·{" "}
                          {shippingLabel(best)}
                        </p>
                      ) : best.discount > 0 && best.couponCode ? (
                        <p className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <Tag className="size-3" /> cupom {best.couponCode}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-medium">{best.sellerName}</span>
                        {best.sellerVerified ? <VerifiedStoreSeal /> : null}
                        <VerifiedOfferSeal />
                        {best.sponsoredActive ? (
                          <Badge className="gap-1">
                            <Megaphone className="size-3" />
                            Patrocinado
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {qualifyingCount} de {totalCount}{" "}
                        {totalCount === 1 ? "oferta" : "ofertas"}
                      </p>
                      <OfferLink offerId={best.id} className="mt-3 w-full" />
                    </div>
                  ) : (
                    <div className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                      Nenhuma oferta com esses filtros
                      {totalCount > 0
                        ? ` (${totalCount} no total).`
                        : "."}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Dicas dos materiais comparados */}
      {dicaMaterials.length > 0 ? (
        <section className="mt-6 border-t pt-8">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Dicas para esses materiais</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Como acertar a impressão dos materiais que você está comparando.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dicaMaterials.map(({ material, tipCount }) => {
              const info = MATERIAL_INFO[material];
              return (
                <Link
                  key={material}
                  href={`/dica/${material}`}
                  className="group rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{materialLabel(material)}</h3>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  {info ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {info ? (
                      <>
                        <span>Bico {info.nozzle}</span>
                        <span>Mesa {info.bed}</span>
                      </>
                    ) : null}
                    <span className="ml-auto font-medium text-foreground">
                      {tipCount} {tipCount === 1 ? "dica" : "dicas"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  icon: Icon,
  label,
  disabled,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={hint}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-primary bg-primary/10 font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
