import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { Estudio } from "@/components/estudio";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Estúdio de posts",
  description: "Gerador de posts da marca para redes sociais.",
  robots: { index: false, follow: false },
};

export default function EstudioPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        icon={Sparkles}
        eyebrow="Interno · divulgação"
        title="Estúdio de posts"
        subtitle="Suba a foto de um filamento ou impressora, escolha o tipo e o formato, e baixe a imagem da marca + a legenda pronta. A foto fica só no seu navegador."
      />
      <Estudio />
    </div>
  );
}
