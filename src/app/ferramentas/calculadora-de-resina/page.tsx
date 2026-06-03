import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

import { ResinCalculator } from "@/components/tools/resin-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Calcule o custo de uma impressão em resina (SLA/LCD): volume em mL × preço por litro, com suportes, extras e margem de lucro.";

export const metadata: Metadata = {
  title: "Calculadora de custo de resina (SLA/LCD)",
  description,
  alternates: { canonical: "/ferramentas/calculadora-de-resina" },
  openGraph: {
    title: "Calculadora de custo de resina",
    description,
    url: "/ferramentas/calculadora-de-resina",
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
        icon={FlaskConical}
        eyebrow="Ferramenta"
        title="Calculadora de resina"
        subtitle="Quanto custa imprimir em resina? Some o volume da peça e dos suportes, o preço por litro e veja o custo e o preço de venda."
      />
      <ResinCalculator />
    </div>
  );
}
