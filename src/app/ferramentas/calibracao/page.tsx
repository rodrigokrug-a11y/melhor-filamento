import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Gauge } from "lucide-react";

import { CalibrationTool } from "@/components/tools/calibration-tool";
import { PageHeader } from "@/components/page-header";

const description =
  "Calibre a sua impressora 3D: ajuste o fluxo de extrusão (flow %) pela parede medida e calcule os passos/mm do extrusor (E-steps).";

export const metadata: Metadata = {
  title: "Calibração de impressora 3D (fluxo e E-steps)",
  description,
  alternates: { canonical: "/ferramentas/calibracao" },
  openGraph: {
    title: "Calibração de impressora 3D (fluxo e E-steps)",
    description,
    url: "/ferramentas/calibracao",
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
        icon={Gauge}
        eyebrow="Ferramenta"
        title="Calibração (fluxo e E-steps)"
        subtitle="Dois ajustes essenciais: corrigir o fluxo de extrusão pela parede medida e acertar os passos/mm do extrusor."
      />
      <CalibrationTool />
    </div>
  );
}
