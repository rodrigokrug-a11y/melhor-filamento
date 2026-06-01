import type { Metadata } from "next";

import { EntrarForm } from "@/components/entrar-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

export default function EntrarPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <Logo className="size-10" />
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
        Entrar
      </h1>
      <p className="mb-6 mt-1 text-center text-muted-foreground">
        Acesse para cadastrar e gerenciar as ofertas da sua loja.
      </p>
      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <EntrarForm />
      </div>
    </div>
  );
}
