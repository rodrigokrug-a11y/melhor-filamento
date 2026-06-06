import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";

const contactEmail = process.env.CONTACT_EMAIL ?? "contact@beadev.ai";

const description =
  "Coloque sua loja de impressão 3D na frente de quem está decidindo a compra. Selo de loja verificada, destaque nas listagens e banner — plano Loja Parceira com mensalidade fixa.";

export const metadata: Metadata = {
  title: "Anuncie no Melhor Filamento — para lojas e fabricantes",
  description,
  alternates: { canonical: "/para-lojas" },
  openGraph: {
    title: "Anuncie no Melhor Filamento",
    description,
    url: "/para-lojas",
    type: "website",
  },
};

const PORQUE = [
  {
    Icon: Target,
    title: "Público de intenção de compra",
    text: "Quem chega aqui já está comparando preço de filamento, resina ou impressora — pronto pra comprar, não só pesquisando.",
  },
  {
    Icon: BadgeCheck,
    title: "Credibilidade do comparador",
    text: "Ranking independente por preço real. Aparecer aqui com selo de loja verificada passa confiança que anúncio avulso não passa.",
  },
  {
    Icon: BarChart3,
    title: "Custo total por região",
    text: "O usuário vê preço + frete pro CEP dele. Sua loja compete onde realmente importa pra fechar a venda.",
  },
];

const INCLUI = [
  "Selo de Loja Verificada nas suas ofertas",
  "Destaque no topo das listagens (posição patrocinada, sempre marcada)",
  "1 banner em página de catálogo à sua escolha",
  "Selo de Oferta Verificada nos seus produtos",
  "Métricas de cliques de saída pra acompanhar o retorno",
  "Cadastro e atualização de ofertas pelo painel",
];

export default function ParaLojasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        icon={Store}
        eyebrow="Para lojas e fabricantes"
        title="Anuncie no Melhor Filamento"
        subtitle="Coloque sua loja na frente de quem está decidindo a compra de impressão 3D — com a credibilidade de um comparador independente."
      />

      {/* Por que anunciar */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PORQUE.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-2xl border bg-card p-5 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-3 font-display text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      {/* Plano Loja Parceira */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--teal-100)]">
        <div className="grad-dark p-6 text-white sm:p-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--teal-300)]">
            Plano Loja Parceira
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Mensalidade fixa, sem surpresa
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#cfe0de]">
            Você paga um valor fixo por mês e não fica refém de CPC. Previsível pra você, simples
            pra gente.
          </p>
          <p className="mt-4 font-display text-3xl font-bold">
            a partir de <span className="text-[var(--green-400)]">R$ 149</span>
            <span className="text-base font-medium text-[#9fc0bc]">/mês</span>
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-3 bg-card p-6 sm:grid-cols-2 sm:p-8">
          {INCLUI.map((item) => (
            <p key={item} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-offer" />
              <span>{item}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Oferta de fundador */}
      <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/50 p-5 sm:flex-row sm:items-center">
        <Sparkles className="size-6 shrink-0 text-brand" />
        <div className="flex-1">
          <p className="font-semibold">Vagas de fundador</p>
          <p className="text-sm text-muted-foreground">
            As 3 primeiras lojas garantem <strong>50% de desconto vitalício</strong> no plano.
            Entram cedo, pagam menos pra sempre.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 rounded-2xl bg-brand-soft p-6 text-center">
        <h2 className="font-display text-xl font-semibold">Quer colocar sua loja aqui?</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Conta pra gente qual é a sua loja e a gente ativa em poucos dias. Sem contrato longo —
          cancela quando quiser.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contato"
            className="grad-brand inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
          >
            Falar com a gente <ArrowRight className="size-4" />
          </Link>
          <a
            href={`mailto:${contactEmail}`}
            className="text-sm font-medium text-teal hover:underline"
          >
            ou {contactEmail}
          </a>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-teal" />
          Anúncios sempre aparecem marcados como{" "}
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Megaphone className="size-3" /> Patrocinado
          </span>{" "}
          — o ranking orgânico continua por preço real.
        </p>
      </div>
    </div>
  );
}
