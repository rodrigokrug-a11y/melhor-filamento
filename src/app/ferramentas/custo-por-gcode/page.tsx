import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCode2 } from "lucide-react";

import { GcodeCostCalculator } from "@/components/tools/gcode-cost-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Calcule o custo de uma impressão direto do arquivo do fatiador. Abra o .gcode (Cura, PrusaSlicer, Orca, Bambu) e veja material, energia e custo total — tudo no navegador.";

export const metadata: Metadata = {
  title: "Custo de impressão pelo G-code",
  description,
  alternates: { canonical: "/ferramentas/custo-por-gcode" },
  openGraph: {
    title: "Custo de impressão pelo G-code",
    description,
    url: "/ferramentas/custo-por-gcode",
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
        icon={FileCode2}
        eyebrow="Ferramenta"
        title="Custo pelo G-code"
        subtitle="Abra o arquivo fatiado e a ferramenta lê o peso e o tempo automaticamente — é só informar o preço do filamento e da energia."
      />
      <GcodeCostCalculator />
    </div>
  );
}
