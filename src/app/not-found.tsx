import Link from "next/link";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Logo className="size-12" />
      <p className="mt-6 font-display text-6xl font-bold text-brand">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
        Página não encontrada
      </h1>
      <p className="mt-2 text-muted-foreground">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Voltar ao início
        </Link>
        <Link
          href="/filamentos"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Ver filamentos
        </Link>
      </div>
    </div>
  );
}
