import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { getCatalog } from "@/lib/catalog";
import { materialLabel } from "@/lib/catalog-types";
import { cn, formatBRL } from "@/lib/utils";

// Densidades (g/cm³) por material, para estimar metros a partir do peso.
const DENSITY: Record<string, number> = {
  PLA: 1.24,
  PETG: 1.27,
  ABS: 1.04,
  ASA: 1.07,
  TPU: 1.21,
  PCTG: 1.23,
  NYLON: 1.14,
};

const description =
  "Ranking dos filamentos mais econômicos do Brasil por quilo (R$/kg) e por metro (R$/m), com base nos preços reais do catálogo.";

export const metadata: Metadata = {
  title: "Ranking de custo de filamentos (R$/kg e R$/m)",
  description,
  alternates: { canonical: "/ferramentas/ranking-de-custo" },
  openGraph: {
    title: "Ranking de custo de filamentos",
    description,
    url: "/ferramentas/ranking-de-custo",
    type: "website",
  },
};

type SP = Promise<{ por?: string }>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { por } = await searchParams;
  const byMeter = por === "metro";
  const { products } = await getCatalog("FILAMENT");

  const rows = products
    .map((p) => {
      const precoKg =
        p.netWeightG > 0 ? p.bestPrice / (p.netWeightG / 1000) : Infinity;
      const d = p.diameterMm ?? 1.75;
      const gPorM = Math.PI * Math.pow(d / 2, 2) * (DENSITY[p.material] ?? 1.24);
      const lenM = gPorM > 0 ? p.netWeightG / gPorM : 0;
      const precoMetro = lenM > 0 ? p.bestPrice / lenM : Infinity;
      return { p, precoKg, precoMetro };
    })
    .filter((r) => Number.isFinite(byMeter ? r.precoMetro : r.precoKg))
    .sort((a, b) =>
      byMeter ? a.precoMetro - b.precoMetro : a.precoKg - b.precoKg,
    )
    .slice(0, 100);

  const tab = (label: string, href: string, on: boolean) => (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 transition-colors",
        on ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/ferramentas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Ferramentas
      </Link>
      <PageHeader
        icon={Coins}
        eyebrow="Ferramenta"
        title="Ranking de custo"
        subtitle="Os filamentos mais econômicos por quilo e por metro, com base nos preços reais do catálogo (sem frete)."
      />

      <div className="mb-4 inline-flex rounded-lg border bg-card p-0.5 text-sm">
        {tab("Por quilo (R$/kg)", "/ferramentas/ranking-de-custo", !byMeter)}
        {tab("Por metro (R$/m)", "/ferramentas/ranking-de-custo?por=metro", byMeter)}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-10 p-3">#</th>
              <th className="p-3">Produto</th>
              <th className="p-3 text-right">Preço</th>
              <th className={cn("p-3 text-right", !byMeter && "text-brand")}>
                R$/kg
              </th>
              <th className={cn("p-3 text-right", byMeter && "text-brand")}>
                R$/m
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={r.p.id} className="hover:bg-accent/40">
                <td className="p-3 tabular-nums text-muted-foreground">
                  {i + 1}
                </td>
                <td className="p-3">
                  <Link
                    href={`/produto/${r.p.slug}`}
                    className="font-medium hover:underline"
                  >
                    {r.p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {r.p.brandName} · {materialLabel(r.p.material)}
                  </div>
                </td>
                <td className="p-3 text-right tabular-nums">
                  {formatBRL(r.p.bestPrice)}
                </td>
                <td
                  className={cn(
                    "p-3 text-right tabular-nums",
                    !byMeter ? "font-semibold" : "text-muted-foreground",
                  )}
                >
                  {formatBRL(r.precoKg)}
                </td>
                <td
                  className={cn(
                    "p-3 text-right tabular-nums",
                    byMeter ? "font-semibold" : "text-muted-foreground",
                  )}
                >
                  {Number.isFinite(r.precoMetro) ? formatBRL(r.precoMetro) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Top 100 por {byMeter ? "menor custo por metro" : "menor custo por quilo"}.
        O R$/m é estimado pela densidade do material e pelo diâmetro. Preços do
        catálogo, sem frete — informe seu CEP nas listagens para o total.
      </p>
    </div>
  );
}
