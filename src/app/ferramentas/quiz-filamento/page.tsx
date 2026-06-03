import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";

import {
  FilamentQuiz,
  type CheapestMap,
} from "@/components/tools/filament-quiz";
import { PageHeader } from "@/components/page-header";
import { getCatalog } from "@/lib/catalog";

const description =
  "Não sabe qual filamento usar? Responda 4 perguntas rápidas e descubra o material ideal (PLA, PETG, ABS, ASA, TPU ou Nylon) pro seu projeto — com a opção mais barata do catálogo.";

export const metadata: Metadata = {
  title: "Qual filamento usar? Quiz de recomendação",
  description,
  alternates: { canonical: "/ferramentas/quiz-filamento" },
  openGraph: {
    title: "Qual filamento usar? Quiz de recomendação",
    description,
    url: "/ferramentas/quiz-filamento",
    type: "website",
  },
};

export default async function Page() {
  const { products } = await getCatalog("FILAMENT");
  const cheapest: CheapestMap = {};
  for (const p of products) {
    const cur = cheapest[p.material];
    if (!cur || p.bestPrice < cur.price) {
      cheapest[p.material] = {
        name: p.name,
        slug: p.slug,
        price: p.bestPrice,
        brand: p.brandName,
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/ferramentas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Ferramentas
      </Link>
      <PageHeader
        icon={Wand2}
        eyebrow="Ferramenta"
        title="Qual filamento pra você?"
        subtitle="Responda 4 perguntas rápidas e descubra o material ideal pro seu projeto — já com a opção mais barata do catálogo."
      />
      <FilamentQuiz cheapest={cheapest} />
    </div>
  );
}
