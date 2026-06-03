import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Thermometer } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { TipForm } from "@/components/tip-form";
import { TipList } from "@/components/tip-list";
import {
  FILAMENT_MATERIALS,
  MATERIAL_INFO,
  materialLabel,
} from "@/lib/catalog-types";
import { getTipsByMaterial } from "@/lib/tips";

// ISR: páginas de material revalidam a cada hora.
export const revalidate = 3600;

export function generateStaticParams() {
  return FILAMENT_MATERIALS.map((material) => ({ material }));
}

type Params = Promise<{ material: string }>;

function isFilamentMaterial(value: string): boolean {
  return (FILAMENT_MATERIALS as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { material } = await params;
  if (!isFilamentMaterial(material)) return { title: "Material não encontrado" };

  const label = materialLabel(material);
  const info = MATERIAL_INFO[material];
  const description = info
    ? `Como imprimir ${label}: ${info.description} Bico ${info.nozzle}, mesa ${info.bed}. Veja dicas da comunidade.`
    : `Dicas e configurações de impressão para ${label}.`;
  const path = `/dica/${material}`;
  return {
    title: `${label} — Como imprimir + dicas`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${label} — Como imprimir + dicas`,
      description,
      url: path,
      type: "website",
    },
  };
}

export default async function DicaPage({ params }: { params: Params }) {
  const { material } = await params;
  if (!isFilamentMaterial(material)) notFound();

  const label = materialLabel(material);
  const info = MATERIAL_INFO[material];
  const tips = await getTipsByMaterial(material);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageBanner placement="DICAS" />
      <Link
        href="/dicas"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Dicas e tutoriais
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
      {info ? (
        <>
          <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Como imprimir
          </h2>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {info.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm">
              <Thermometer className="size-4 text-muted-foreground" />
              Bico <span className="font-medium">{info.nozzle}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm">
              <Layers className="size-4 text-muted-foreground" />
              Mesa <span className="font-medium">{info.bed}</span>
            </span>
          </div>
        </>
      ) : null}

      <p className="mt-4 text-sm text-muted-foreground">
        Procurando onde comprar?{" "}
        <Link
          href={`/filamentos?material=${material}`}
          className="text-primary hover:underline"
        >
          Ver filamentos de {label}
        </Link>
        .
      </p>

      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Dicas da comunidade</h2>
            <span className="text-sm text-muted-foreground">
              {tips.length} {tips.length === 1 ? "dica" : "dicas"}
            </span>
          </div>
          <TipList tips={tips} />
        </div>
        <div>
          <TipForm material={material} materialLabel={label} />
        </div>
      </section>
    </div>
  );
}
