import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";

import { MaterialComparator } from "@/components/tools/material-comparator";
import { PageHeader } from "@/components/page-header";

const description =
  "Compare materiais de impressão 3D lado a lado — PLA, PETG, ABS, ASA, TPU, Nylon e PC: temperatura do bico e da mesa, resistência, flexibilidade, dificuldade e usos.";

export const metadata: Metadata = {
  title: "Comparador de materiais para impressão 3D",
  description,
  alternates: { canonical: "/ferramentas/comparador-de-materiais" },
  openGraph: {
    title: "Comparador de materiais para impressão 3D",
    description,
    url: "/ferramentas/comparador-de-materiais",
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
        icon={GitCompare}
        eyebrow="Ferramenta"
        title="Comparador de materiais"
        subtitle="PLA, PETG, ABS, ASA, TPU, Nylon e PC lado a lado: temperatura, resistência, flexibilidade, dificuldade e usos."
      />
      <MaterialComparator />
    </div>
  );
}
