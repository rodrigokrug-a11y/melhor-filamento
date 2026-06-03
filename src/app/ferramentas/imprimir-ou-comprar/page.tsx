import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { PrintOrBuyCalculator } from "@/components/tools/print-or-buy-calculator";
import { PageHeader } from "@/components/page-header";

const description =
  "Vale a pena imprimir você mesmo ou comprar pronto? Compare o custo de impressão (material + energia) com o preço de compra e veja quanto economiza.";

export const metadata: Metadata = {
  title: "Imprimir ou comprar? Calculadora de impressão 3D",
  description,
  alternates: { canonical: "/ferramentas/imprimir-ou-comprar" },
  openGraph: {
    title: "Imprimir ou comprar?",
    description,
    url: "/ferramentas/imprimir-ou-comprar",
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
        icon={ShoppingCart}
        eyebrow="Ferramenta"
        title="Imprimir ou comprar?"
        subtitle="Compare o custo de imprimir você mesmo com o preço de comprar pronto e descubra quanto economiza (ou não)."
      />
      <PrintOrBuyCalculator />
    </div>
  );
}
