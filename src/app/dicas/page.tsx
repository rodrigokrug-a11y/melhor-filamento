import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, Wrench } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { MATERIAL_INFO, materialLabel } from "@/lib/catalog-types";
import { getMaterialsOverview } from "@/lib/tips";

// ISR: revalida a cada hora (dicas aprovadas mudam o contador).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dicas e tutoriais de impressão 3D",
  description:
    "Guias práticos e dicas da comunidade para PLA, PETG, ABS, TPU, ASA, PCTG e Nylon: temperaturas, adesão, velocidade e mais.",
  alternates: { canonical: "/dicas" },
  openGraph: {
    title: "Dicas e tutoriais de impressão 3D",
    description:
      "Guias práticos e dicas da comunidade para cada tipo de filamento 3D.",
    url: "/dicas",
    type: "website",
  },
};

export default async function DicasPage() {
  const overview = await getMaterialsOverview();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageBanner placement="DICAS" />
      <PageHeader
        icon={Lightbulb}
        eyebrow="Aprenda a imprimir"
        title="Dicas e tutoriais"
        subtitle="Guias práticos e dicas da comunidade para imprimir cada material com sucesso. Escolha um filamento para ver o tutorial e as dicas."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/ferramentas"
          className="group flex items-center gap-3 rounded-2xl border bg-brand-soft/50 p-4 transition-colors hover:bg-brand-soft"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
            <Wrench className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Ferramentas</p>
            <p className="text-sm text-muted-foreground">
              Calculadoras de custo, filamento e mais.
            </p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/receitas"
          className="group flex items-center gap-3 rounded-2xl border bg-brand-soft/50 p-4 transition-colors hover:bg-brand-soft"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
            <BookOpen className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Configurações de impressão</p>
            <p className="text-sm text-muted-foreground">
              Perfis de fatiador da comunidade, por material.
            </p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {overview.map(({ material, tipCount }) => {
          const info = MATERIAL_INFO[material];
          return (
            <Link
              key={material}
              href={`/dica/${material}`}
              className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">
                  {materialLabel(material)}
                </h2>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              {info ? (
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {info.description}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
    </div>
  );
}
