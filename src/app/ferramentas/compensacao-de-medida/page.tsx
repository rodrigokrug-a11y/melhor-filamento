import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";

import { ShrinkageCalculator } from "@/components/tools/shrinkage-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Sua peça saiu maior ou menor que o modelo? Calcule o fator de escala para compensar o encolhimento (ABS, resina) e acertar a medida.";

export const metadata: Metadata = {
  title: "Compensação de medida / encolhimento na impressão 3D",
  description,
  alternates: { canonical: "/ferramentas/compensacao-de-medida" },
  openGraph: {
    title: "Compensação de medida na impressão 3D",
    description,
    url: "/ferramentas/compensacao-de-medida",
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
        icon={Ruler}
        eyebrow="Ferramenta"
        title="Compensação de medida"
        subtitle="A peça saiu fora de medida? Informe o valor do modelo e o que saiu de verdade e veja a escala pra compensar."
      />
      <ShrinkageCalculator />
    </div>
  );
}
