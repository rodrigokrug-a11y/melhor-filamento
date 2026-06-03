import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { RecipeForm } from "@/components/recipe-form";
import { getRecipeMaterialCounts, getRecipes } from "@/lib/recipes";
import { cn } from "@/lib/utils";

const FILTERS = ["PLA", "PETG", "ABS", "TPU", "ASA", "PCTG", "NYLON"];

const description =
  "Perfis de fatiador que funcionam, enviados pela comunidade: temperatura do bico e da mesa, velocidade, retração e dicas por material e impressora.";

export const metadata: Metadata = {
  title: "Receitas de impressão 3D (perfis de fatiador)",
  description,
  alternates: { canonical: "/receitas" },
  openGraph: {
    title: "Receitas de impressão 3D",
    description,
    url: "/receitas",
    type: "website",
  },
};

type SP = Promise<{ material?: string }>;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}

export default async function ReceitasPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { material } = await searchParams;
  const mat = material && FILTERS.includes(material) ? material : undefined;
  const [recipes, counts] = await Promise.all([
    getRecipes(mat),
    getRecipeMaterialCounts(),
  ]);

  const chip = (on: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm transition-colors",
      on
        ? "border-brand bg-brand text-white"
        : "bg-background text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageBanner placement="GLOBAL" />
      <PageHeader
        icon={BookOpen}
        eyebrow="Comunidade"
        title="Receitas de impressão"
        subtitle="Perfis de fatiador que funcionam, enviados pela comunidade — temperatura, velocidade, retração e dicas por material e impressora."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/receitas" className={chip(!mat)}>
          Todos
        </Link>
        {FILTERS.map((m) => (
          <Link key={m} href={`/receitas?material=${m}`} className={chip(mat === m)}>
            {m}
            {counts[m] ? ` (${counts[m]})` : ""}
          </Link>
        ))}
      </div>

      <details className="mb-6 rounded-2xl border bg-muted/30 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <Plus className="size-4" />
          Enviar uma receita
        </summary>
        <div className="mt-4">
          <RecipeForm />
        </div>
      </details>

      {recipes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhuma receita {mat ? `de ${mat} ` : ""}ainda. Seja o primeiro a
          enviar acima!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((r) => (
            <article key={r.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {r.material}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {r.printer}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <Stat label="Bico" value={`${r.nozzleTempC} °C`} />
                <Stat label="Mesa" value={`${r.bedTempC} °C`} />
                {r.speedMms ? (
                  <Stat label="Velocidade" value={`${r.speedMms} mm/s`} />
                ) : null}
                {r.retractionMm != null ? (
                  <Stat label="Retração" value={`${r.retractionMm} mm`} />
                ) : null}
                {r.flowPct ? <Stat label="Fluxo" value={`${r.flowPct}%`} /> : null}
                {r.fanPct != null ? (
                  <Stat label="Ventoinha" value={`${r.fanPct}%`} />
                ) : null}
              </div>
              {r.notes ? (
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                  {r.notes}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                enviada por {r.authorName}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
