import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Crie sua conta no Melhor Filamento para salvar ofertas, avaliar produtos e compartilhar cupons.",
  robots: { index: false },
};

export default function CriarContaPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <Logo className="size-10" />
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
        Criar conta
      </h1>
      <p className="mb-6 mt-1 text-center text-muted-foreground">
        Salve ofertas favoritas, avalie produtos e compartilhe cupons com a
        comunidade.
      </p>
      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
