"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, X } from "lucide-react";

import { OfferLink } from "@/components/offer-link";
import { RegionNotice } from "@/components/region-notice";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/components/use-region";
import {
  type CompareProduct,
  type ProductKind,
  MATERIAL_INFO,
  PRINTER_SPEC_FIELDS,
  materialLabel,
} from "@/lib/catalog-types";
import { estimateShipping, totalForRegion } from "@/lib/shipping";
import { cn, formatBRL } from "@/lib/utils";

type MaterialOverview = { material: string; tipCount: number };

const MAX = 4;
const DASH = "—";
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Melhor oferta do produto: menor total com frete (com CEP) ou menor preço. */
function bestOffer(
  p: CompareProduct,
  uf: string | null,
): { value: number; offerId: string } | null {
  let value = Infinity;
  let offerId = "";
  for (const o of p.offers) {
    const v = uf
      ? totalForRegion(
          o.effectivePrice,
          estimateShipping(o.shippingRules, uf, o.effectivePrice),
        )
      : o.effectivePrice;
    if (v < value) {
      value = v;
      offerId = o.id;
    }
  }
  return p.offers.length ? { value, offerId } : null;
}

export function CompareView({
  products,
  materials,
  initialSlugs,
  kind = "FILAMENT",
}: {
  products: CompareProduct[];
  materials: MaterialOverview[];
  initialSlugs: string[];
  kind?: ProductKind;
}) {
  const { region } = useRegion();
  const uf = region?.uf ?? null;
  const isPrinter = kind === "PRINTER";

  const [ids, setIds] = useState<string[]>(() => {
    const out: string[] = [];
    for (const s of initialSlugs) {
      const p = products.find((x) => x.slug === s);
      if (p && !out.includes(p.id)) out.push(p.id);
    }
    if (out.length === 0) for (const p of products.slice(0, 3)) out.push(p.id);
    return out.slice(0, MAX);
  });
  const [fPrimary, setFPrimary] = useState("");
  const [fBrand, setFBrand] = useState("");

  const selected = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is CompareProduct => Boolean(p));

  // Eixo principal do filtro: tecnologia (impressoras) ou material (insumos).
  const primaryOf = (p: CompareProduct) =>
    isPrinter ? (p.specs?.tecnologia ?? "") : p.material;
  const primaryLabel = (v: string) => (isPrinter ? v : materialLabel(v));
  const primaryList = [...new Set(products.map(primaryOf).filter(Boolean))].sort(
    (a, b) => primaryLabel(a).localeCompare(primaryLabel(b), "pt-BR"),
  );
  const brandsList = [...new Set(products.map((p) => p.brandName))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const candidates = products.filter(
    (p) =>
      !ids.includes(p.id) &&
      (!fPrimary || primaryOf(p) === fPrimary) &&
      (!fBrand || p.brandName === fBrand),
  );

  const computed = selected.map((p) => ({ p, best: bestOffer(p, uf) }));
  const cheapest = Math.min(
    ...computed.filter((c) => c.best).map((c) => c.best!.value),
    Infinity,
  );

  const specKeys = [
    ...new Set(selected.flatMap((p) => (p.specs ? Object.keys(p.specs) : []))),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const rows: { label: string; value: (p: CompareProduct) => string }[] = isPrinter
    ? [
        { label: "Marca", value: (p) => p.brandName || DASH },
        ...PRINTER_SPEC_FIELDS.map((f) => ({
          label: f.label,
          value: (p: CompareProduct) => p.specs?.[f.key] ?? DASH,
        })),
      ]
    : [
        { label: "Marca", value: (p) => p.brandName || DASH },
        { label: "Tipo", value: (p) => materialLabel(p.material) },
        {
          label: "Cor",
          value: (p) => (p.color && p.color !== "Variado" ? p.color : DASH),
        },
        { label: "Peso", value: (p) => (p.netWeightG ? `${p.netWeightG} g` : DASH) },
        {
          label: "Diâmetro",
          value: (p) => (p.diameterMm ? `${p.diameterMm} mm` : DASH),
        },
        {
          label: "Temp. do bico",
          value: (p) => MATERIAL_INFO[p.material]?.nozzle ?? DASH,
        },
        {
          label: "Temp. da mesa",
          value: (p) => MATERIAL_INFO[p.material]?.bed ?? DASH,
        },
      ];

  const dicaMaterials = [...new Set(selected.map((p) => p.material))]
    .filter((m) => MATERIAL_INFO[m])
    .map((m) => ({
      material: m,
      tipCount: materials.find((x) => x.material === m)?.tipCount ?? 0,
    }))
    .sort((a, b) =>
      materialLabel(a.material).localeCompare(materialLabel(b.material), "pt-BR"),
    );

  function add(id: string) {
    if (id && !ids.includes(id) && ids.length < MAX) setIds([...ids, id]);
  }
  function remove(id: string) {
    setIds(ids.filter((x) => x !== id));
  }

  return (
    <div className="space-y-6">
      {/* Montar a comparação */}
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            {isPrinter ? "Impressoras" : "Produtos"} para comparar (
            {selected.length}/{MAX})
          </p>
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => setIds([])}
              className="text-xs text-muted-foreground hover:underline"
            >
              limpar
            </button>
          ) : null}
        </div>

        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remover ${p.name}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {selected.length < MAX ? (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1.4fr]">
            <select
              value={fPrimary}
              onChange={(e) => setFPrimary(e.target.value)}
              className={selectClass}
              aria-label={isPrinter ? "Filtrar por tecnologia" : "Filtrar por tipo"}
            >
              <option value="">
                {isPrinter ? "Todas as tecnologias" : "Todos os tipos"}
              </option>
              {primaryList.map((m) => (
                <option key={m} value={m}>
                  {primaryLabel(m)}
                </option>
              ))}
            </select>
            <select
              value={fBrand}
              onChange={(e) => setFBrand(e.target.value)}
              className={selectClass}
              aria-label="Filtrar por marca"
            >
              <option value="">Todas as marcas</option>
              {brandsList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value=""
              onChange={(e) => add(e.target.value)}
              className={selectClass}
              aria-label="Adicionar produto"
            >
              <option value="">
                + Adicionar {isPrinter ? "impressora" : "produto"}…
              </option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.brandName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Máximo de {MAX} itens. Remova um para trocar.
          </p>
        )}
      </div>

      <RegionNotice />

      {/* Tabela de comparação */}
      {selected.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Adicione itens acima para comparar lado a lado.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-32 p-3 text-left align-bottom text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Características
                </th>
                {computed.map(({ p }) => (
                  <th
                    key={p.id}
                    className="min-w-[150px] border-l p-3 text-left align-bottom"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/produto/${p.slug}`}
                        className="font-semibold leading-tight hover:underline"
                      >
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label={`Remover ${p.name}`}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="bg-muted/30">
                <td className="p-3 font-medium">
                  {uf ? "Menor total (c/ frete)" : "Menor preço"}
                </td>
                {computed.map(({ p, best }) => {
                  const isCheap =
                    best != null &&
                    best.value === cheapest &&
                    cheapest !== Infinity;
                  return (
                    <td
                      key={p.id}
                      className={cn("border-l p-3", isCheap && "bg-emerald-500/10")}
                    >
                      {best ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-display text-base font-bold tnum">
                              {formatBRL(best.value)}
                            </span>
                            {isCheap ? (
                              <Badge variant="success">melhor</Badge>
                            ) : null}
                          </div>
                          <OfferLink offerId={best.offerId} className="w-full" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{DASH}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">Lojas</td>
                {computed.map(({ p }) => (
                  <td key={p.id} className="border-l p-3">
                    {p.offers.length || DASH}
                  </td>
                ))}
              </tr>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="p-3 text-muted-foreground">{row.label}</td>
                  {computed.map(({ p }) => (
                    <td key={p.id} className="border-l p-3">
                      {row.value(p)}
                    </td>
                  ))}
                </tr>
              ))}
              {!isPrinter
                ? specKeys.map((k) => (
                    <tr key={k}>
                      <td className="p-3 text-muted-foreground">{k}</td>
                      {computed.map(({ p }) => (
                        <td key={p.id} className="border-l p-3">
                          {p.specs?.[k] ?? DASH}
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Onde aparece &ldquo;{DASH}&rdquo; a informação ainda não foi cadastrada —
        o fabricante pode incluí-la.
      </p>

      {/* Dicas dos materiais comparados (insumos) */}
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
