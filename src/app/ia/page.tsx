import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, ScanSearch, Sparkles, Zap } from "lucide-react";

const description =
  "Ferramentas de IA para impressão 3D: um assistente que tira suas dúvidas e um diagnóstico por foto que identifica o problema da sua peça e diz como corrigir. Grátis, em português.";

export const metadata: Metadata = {
  title: "IA para impressão 3D — assistente e diagnóstico por foto",
  description,
  alternates: { canonical: "/ia" },
  openGraph: {
    title: "IA para melhorar a sua impressão 3D",
    description,
    url: "/ia",
    type: "website",
  },
};

const TOOLS = [
  {
    href: "/ferramentas/assistente",
    icon: Bot,
    title: "Assistente de impressão",
    desc: "Tire qualquer dúvida — materiais, temperaturas, velocidade, retração, adesão e troubleshooting. Respostas claras na hora.",
    cta: "Conversar com a IA",
  },
  {
    href: "/ferramentas/diagnostico",
    icon: ScanSearch,
    title: "Diagnóstico por foto",
    desc: "Sua peça saiu com defeito? Envie uma foto e a IA identifica o problema (warping, stringing, extrusão, adesão…) e sugere a correção.",
    cta: "Enviar uma foto",
  },
];

export default function IaPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-slate-900 via-slate-900 to-[#06201f] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-cyan-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-300">
            <Sparkles className="size-4" />
            Ferramentas de IA
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            IA para melhorar a sua{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent">
              impressão 3D
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Um especialista de impressão 3D no seu bolso: tire dúvidas e
            diagnostique problemas pela foto. Grátis, em português, na hora.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/ferramentas/assistente"
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-300"
            >
              <Bot className="size-4" />
              Falar com o assistente
            </Link>
            <Link
              href="/ferramentas/diagnostico"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ScanSearch className="size-4" />
              Diagnosticar por foto
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
            >
              <span className="grad-brand flex size-14 items-center justify-center rounded-2xl text-white">
                <t.icon className="size-7" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">{t.title}</h2>
              <p className="mt-2 flex-1 text-muted-foreground">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-medium text-brand">
                {t.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="size-4 text-brand" />
            Respostas na hora
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-4 text-brand" />
            Grátis e em português
          </span>
          <span>Powered by Claude (Anthropic)</span>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Respostas geradas por IA podem conter erros — confira informações
          críticas.
        </p>
      </div>
    </div>
  );
}
