import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

import { EnergyCalculator } from "@/components/tools/energy-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Quanto a sua impressora 3D gasta de energia? Calcule o consumo (kWh) e o custo por impressão e por mês a partir da potência e do preço do kWh.";

export const metadata: Metadata = {
  title: "Custo de energia da impressora 3D",
  description,
  alternates: { canonical: "/ferramentas/custo-de-energia" },
  openGraph: {
    title: "Custo de energia da impressora 3D",
    description,
    url: "/ferramentas/custo-de-energia",
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
        icon={Zap}
        eyebrow="Ferramenta"
        title="Custo de energia"
        subtitle="Quanto a sua impressora gasta de luz? Veja o consumo em kWh e o custo por impressão e por mês."
      />
      <EnergyCalculator />
    </div>
  );
}
