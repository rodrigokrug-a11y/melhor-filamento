"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

// Error boundary de rota: captura falhas de render/dados (ex.: query do Prisma
// falhando) e mostra uma tela amigável com header/footer, em vez de 500 cru.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
        Algo deu errado
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tivemos um problema temporário ao carregar esta página. Tente novamente em instantes.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="grad-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Voltar à home
        </Link>
      </div>
    </div>
  );
}
