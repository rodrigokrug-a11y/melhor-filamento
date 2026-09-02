import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ScanSearch } from "lucide-react";

import { auth } from "@/auth";
import { AiLoginGate } from "@/components/tools/ai-login-gate";
import { PrintDiagnosis } from "@/components/tools/print-diagnosis";
import { PageHeader } from "@/components/page-header";

const description =
  "Mande a foto de uma impressão 3D com problema e a IA identifica o que houve (warping, stringing, sub/superextrusão, adesão…) e sugere as correções.";

export const metadata: Metadata = {
  title: "Diagnóstico de impressão 3D por foto (IA)",
  description,
  alternates: { canonical: "/ferramentas/diagnostico" },
  openGraph: {
    title: "Diagnóstico de impressão 3D por foto (IA)",
    description,
    url: "/ferramentas/diagnostico",
    type: "website",
  },
};

export default async function Page() {
  const session = await auth();
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
        icon={ScanSearch}
        eyebrow="Ferramenta · IA"
        title="Diagnóstico por foto"
        subtitle="Sua impressão deu errado? Envie uma foto e a IA identifica o problema e diz como corrigir."
      />
      {session?.user ? (
        <PrintDiagnosis />
      ) : (
        <AiLoginGate
          title="Entre para diagnosticar por foto"
          description="A análise de imagem é a chamada de IA mais cara do site, por isso é exclusiva para quem tem conta. É grátis e leva menos de um minuto."
          callbackUrl="/ferramentas/diagnostico"
        />
      )}
    </div>
  );
}
