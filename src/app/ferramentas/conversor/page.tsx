import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";

import { ConverterTool } from "@/components/tools/converter-tool";
import { PageHeader } from "@/components/page-header";

const description =
  "Conversor para impressão 3D: temperatura (°C ↔ °F) e medidas (mm, cm e polegadas). Útil para seguir perfis e guias em inglês.";

export const metadata: Metadata = {
  title: "Conversor para impressão 3D (°C/°F, mm/polegada)",
  description,
  alternates: { canonical: "/ferramentas/conversor" },
  openGraph: {
    title: "Conversor para impressão 3D",
    description,
    url: "/ferramentas/conversor",
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
        icon={ArrowLeftRight}
        eyebrow="Ferramenta"
        title="Conversor"
        subtitle="Temperatura (°C ↔ °F) e medidas (mm, cm, polegadas) — pra seguir perfis e guias em inglês sem dor de cabeça."
      />
      <ConverterTool />
    </div>
  );
}
