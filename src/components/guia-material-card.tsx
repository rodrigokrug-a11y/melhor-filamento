import Link from "next/link";
import { ArrowRight, Check, Lightbulb, Minus, Thermometer } from "lucide-react";

import type { GuiaMaterial } from "@/lib/guias";

function difficultyLabel(n: number): string {
  return ["", "Muito fácil", "Fácil", "Intermediário", "Difícil", "Avançado"][n] ?? "—";
}

export function GuiaMaterialCard({ m }: { m: GuiaMaterial }) {
  const slug = m.key.toLowerCase();
  return (
    <article
      id={`material-${m.key}`}
      className="scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold tracking-tight">{m.nome}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{m.resumo}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
            {difficultyLabel(m.dificuldade)}
          </span>
          <span className="rounded-full bg-deal-bg px-2.5 py-1 font-mono font-bold text-accent-text">
            {m.preco}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed">{m.oque}</p>

      <div className="mt-4 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border bg-muted/40 px-4 py-2 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Thermometer className="size-4 text-brand" /> Bico <strong className="tnum">{m.bico}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Thermometer className="size-4 text-offer" /> Mesa <strong className="tnum">{m.mesa}</strong>
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ul className="space-y-1.5">
          {m.pros.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-offer" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <ul className="space-y-1.5">
          {m.contras.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Minus className="mt-0.5 size-4 shrink-0 text-red-500" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm">
        <span className="font-semibold">Para que serve: </span>
        <span className="text-muted-foreground">{m.usos}</span>
      </p>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand-soft/60 p-3.5 text-sm">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" />
        <p>
          <span className="font-semibold text-brand">Dica: </span>
          {m.dica}
        </p>
      </div>

      {m.catalogo ? (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 text-sm font-medium">
          <Link
            href={`/melhor/${slug}`}
            className="group inline-flex items-center gap-1 text-teal hover:underline"
          >
            Ver {m.nome} mais barato
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href={`/filamentos?material=${m.key}`} className="text-teal hover:underline">
            Comparar ofertas
          </Link>
          <Link href={`/dica/${m.key}`} className="text-teal hover:underline">
            Como imprimir
          </Link>
        </div>
      ) : null}
    </article>
  );
}
