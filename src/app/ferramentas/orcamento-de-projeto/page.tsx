import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { ProjectBudgetCalculator } from "@/components/tools/project-budget-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Orce um projeto de impressão 3D com várias peças: informe o peso e o tempo de cada uma e chegue ao custo total e ao preço de venda.";

export const metadata: Metadata = {
  title: "Orçamento de projeto de impressão 3D",
  description,
  alternates: { canonical: "/ferramentas/orcamento-de-projeto" },
  openGraph: {
    title: "Orçamento de projeto de impressão 3D",
    description,
    url: "/ferramentas/orcamento-de-projeto",
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
        icon={ClipboardList}
        eyebrow="Ferramenta"
        title="Orçamento de projeto"
        subtitle="Várias peças num cálculo só: informe o peso e o tempo de cada uma e veja o custo total e o preço sugerido."
      />
      <ProjectBudgetCalculator />
    </div>
  );
}
