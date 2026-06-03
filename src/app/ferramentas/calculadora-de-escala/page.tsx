import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scaling } from "lucide-react";

import { ScaleCalculator } from "@/components/tools/scale-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Redimensione um modelo 3D por porcentagem ou medida alvo e veja o impacto no material, no peso e no custo (o volume cresce com o cubo da escala).";

export const metadata: Metadata = {
  title: "Calculadora de escala para impressão 3D",
  description,
  alternates: { canonical: "/ferramentas/calculadora-de-escala" },
  openGraph: {
    title: "Calculadora de escala para impressão 3D",
    description,
    url: "/ferramentas/calculadora-de-escala",
    type: "website",
  },
};

export default function Page() {
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
        icon={Scaling}
        eyebrow="Ferramenta"
        title="Calculadora de escala"
        subtitle="Redimensione por porcentagem ou medida alvo e veja o impacto no material, peso e custo da peça."
      />
      <ScaleCalculator />
    </div>
  );
}
