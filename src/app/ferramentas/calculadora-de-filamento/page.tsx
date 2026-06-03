import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Disc3 } from "lucide-react";

import { FilamentCalculator } from "@/components/tools/filament-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Converta peso ↔ comprimento de filamento (por material e diâmetro) e veja o custo. Descubra quanto sobra no rolo e quantas peças ainda dá pra imprimir.";

export const metadata: Metadata = {
  title: "Calculadora de filamento (peso, comprimento e custo)",
  description,
  alternates: { canonical: "/ferramentas/calculadora-de-filamento" },
  openGraph: {
    title: "Calculadora de filamento",
    description,
    url: "/ferramentas/calculadora-de-filamento",
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
        icon={Disc3}
        eyebrow="Ferramenta"
        title="Calculadora de filamento"
        subtitle="Converta peso ↔ comprimento (por material e diâmetro) e veja o custo. Bom pra saber quanto sobra no rolo e quantas peças ainda cabem."
      />
      <FilamentCalculator />
    </div>
  );
}
