import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";

/**
 * Substitui a ferramenta de IA quando não há sessão.
 *
 * A rota já recusa sem conta, mas deixar o usuário escrever a pergunta para só
 * então receber um erro desperdiça o esforço dele. Aqui a condição aparece
 * antes, junto do motivo e do caminho para resolver.
 */
export function AiLoginGate({
  title,
  description,
  callbackUrl,
}: {
  title: string;
  description: string;
  /** Para onde voltar depois de entrar. */
  callbackUrl: string;
}) {
  const next = encodeURIComponent(callbackUrl);

  return (
    <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Sparkles className="size-6" />
      </span>

      <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href={`/entrar?callbackUrl=${next}`}
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-teal"
        >
          <LogIn className="size-4" />
          Entrar
        </Link>
        <Link
          href={`/criar-conta?callbackUrl=${next}`}
          className="inline-flex h-10 items-center whitespace-nowrap rounded-full border-[1.5px] border-input px-5 text-sm font-semibold transition-colors hover:border-brand hover:bg-brand-soft"
        >
          Criar conta grátis
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        O restante do site — catálogo, comparador e calculadoras — continua
        aberto, sem cadastro.
      </p>
    </div>
  );
}
