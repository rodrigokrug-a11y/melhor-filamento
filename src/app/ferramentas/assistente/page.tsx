import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

import { auth } from "@/auth";
import { AiLoginGate } from "@/components/tools/ai-login-gate";
import { AssistantChat } from "@/components/tools/assistant-chat";
import { PageHeader } from "@/components/page-header";

const description =
  "Assistente de impressão 3D com IA: tire dúvidas sobre materiais, configurações de fatiador e troubleshooting (warping, stringing, adesão e mais).";

export const metadata: Metadata = {
  title: "Assistente de impressão 3D (IA)",
  description,
  alternates: { canonical: "/ferramentas/assistente" },
  openGraph: {
    title: "Assistente de impressão 3D (IA)",
    description,
    url: "/ferramentas/assistente",
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
        icon={Bot}
        eyebrow="Ferramenta · IA"
        title="Assistente de impressão 3D"
        subtitle="Tire dúvidas sobre materiais, configurações e problemas de impressão — respostas na hora."
      />
      {session?.user ? (
        <AssistantChat />
      ) : (
        <AiLoginGate
          title="Entre para conversar com o assistente"
          description="Cada resposta consome a API de IA, então o assistente é exclusivo para quem tem conta. É grátis e leva menos de um minuto."
          callbackUrl="/ferramentas/assistente"
        />
      )}
    </div>
  );
}
