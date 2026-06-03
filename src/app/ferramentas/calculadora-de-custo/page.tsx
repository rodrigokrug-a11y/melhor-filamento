import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";

import { CostCalculator } from "@/components/cost-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Calcule o custo real de uma impressão 3D — material, energia, desgaste e falhas — e descubra o preço de venda com a sua margem. Grátis, no navegador.";

export const metadata: Metadata = {
  title: "Calculadora de custo de impressão 3D",
  description,
  alternates: { canonical: "/ferramentas/calculadora-de-custo" },
  openGraph: {
    title: "Calculadora de custo de impressão 3D",
    description,
    url: "/ferramentas/calculadora-de-custo",
    type: "website",
  },
};

export default function CalculadoraDeCustoPage() {
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
        icon={Calculator}
        eyebrow="Ferramenta"
        title="Calculadora de custo"
        subtitle="Quanto custa imprimir uma peça? Some material, energia, desgaste e a taxa de falha — e veja o preço de venda com a sua margem."
      />
      <CostCalculator />
    </div>
  );
}
