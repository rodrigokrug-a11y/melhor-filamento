import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { getGuias } from "@/lib/guias";

export const metadata: Metadata = {
  title: "Guias de impressão 3D",
  description:
    "Guias completos e práticos de impressão 3D: tipos de filamento, escolha de material, temperaturas e mais — escritos para quem quer comprar e imprimir melhor.",
  alternates: { canonical: "/guias" },
  openGraph: {
    title: "Guias de impressão 3D | Melhor Filamento",
    description:
      "Guias completos e práticos de impressão 3D, do filamento certo ao melhor custo.",
    url: "/guias",
    type: "website",
  },
};

export default function GuiasPage() {
  const guias = getGuias();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        icon={BookOpen}
        eyebrow="Conteúdo"
        title="Guias de impressão 3D"
        subtitle="Guias completos e sem enrolação: do filamento certo para cada peça ao melhor custo. Feitos para quem quer comprar e imprimir melhor."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {guias.map((g) => (
          <Link
            key={g.slug}
            href={`/guias/${g.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
          >
            <Image
              src={`/guias/${g.slug}/opengraph-image`}
              alt=""
              width={1200}
              height={630}
              unoptimized
              className="aspect-[1200/630] w-full border-b object-cover"
            />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">{g.titulo}</h2>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.resumo}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {g.leituraMin} min de leitura
                </span>
                <span className="ml-auto">Atualizado em {g.atualizadoLabel.toLowerCase()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
