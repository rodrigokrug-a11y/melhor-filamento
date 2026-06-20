import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Boxes, Clock, Flame, Lightbulb, RefreshCw, Wrench } from "lucide-react";

import { GuiaMaterialCard } from "@/components/guia-material-card";
import { GuiaTabela } from "@/components/guia-tabela";
import { Markdown } from "@/components/markdown";
import { getGuia, getGuiaSlugs } from "@/lib/guias";
import { guiaDestaque } from "@/lib/guias-visual";
import { guiaJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getGuiaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) return {};
  return {
    title: guia.titulo,
    description: guia.descricao,
    alternates: { canonical: `/guias/${guia.slug}` },
    openGraph: {
      title: guia.titulo,
      description: guia.descricao,
      url: `/guias/${guia.slug}`,
      type: "article",
    },
  };
}

const RELACIONADOS = [
  { href: "/filamentos", label: "Comparar preços de filamentos", Icon: Boxes },
  { href: "/ofertas", label: "Ofertas do dia", Icon: Flame },
  { href: "/ferramentas", label: "Calcular o custo de uma impressão", Icon: Wrench },
  { href: "/dicas", label: "Dicas por material", Icon: Lightbulb },
];

export default async function GuiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) notFound();

  const materiais = guia.materiais ?? [];
  const temMateriais = materiais.length > 0;
  const toc = [
    ...(temMateriais
      ? [
          { id: "tabela", label: "Tabela comparativa" },
          { id: "materiais", label: "Os filamentos, um por um" },
        ]
      : []),
    ...guia.secoes.map((s) => ({ id: s.id, label: s.titulo })),
    { id: "faq", label: "Perguntas frequentes" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: guiaJsonLd(guia) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/guias" className="hover:text-foreground">
          Guias
        </Link>{" "}
        / <span className="text-foreground">{guia.titulo}</span>
      </nav>

      <Image
        src={`/guias/${guia.slug}/opengraph-image`}
        alt=""
        width={1200}
        height={630}
        unoptimized
        priority
        className="mb-6 h-auto w-full rounded-2xl border"
      />

      <header>
        <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-teal">
          Guia
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{guia.titulo}</h1>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{guia.subtitulo}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {guia.leituraMin} min de leitura
          </span>
          <span className="inline-flex items-center gap-1">
            <RefreshCw className="size-3.5" /> Atualizado em {guia.atualizadoLabel.toLowerCase()}
          </span>
        </div>
      </header>

      {/* Intro */}
      <Markdown
        content={guia.intro}
        className="mt-6 space-y-3 text-[15px] leading-relaxed text-muted-foreground"
      />

      {/* Índice */}
      <nav
        aria-label="Conteúdo do guia"
        className="mt-8 rounded-2xl border bg-muted/30 p-5"
      >
        <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Neste guia
        </p>
        <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {toc.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="text-teal hover:underline">
                <span className="tnum text-muted-foreground">{i + 1}.</span> {t.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {temMateriais ? (
        <>
          {/* Tabela comparativa */}
          <section id="tabela" className="mt-10 scroll-mt-24">
            <h2 className="mb-1 font-display text-2xl font-bold tracking-tight">
              Tabela comparativa
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Um resumo de cada filamento. Clique no nome para pular direto para os detalhes.
            </p>
            <GuiaTabela materiais={materiais} />
            <p className="mt-2 text-xs text-muted-foreground">
              Preço relativo no Brasil:{" "}
              <span className="font-mono font-bold text-offer">$</span> mais barato ·{" "}
              <span className="font-mono font-bold text-offer">$$$</span> mais caro. Temperaturas são
              faixas típicas — confira sempre a embalagem do fabricante.
            </p>
          </section>

          {/* Materiais, um a um */}
          <section id="materiais" className="mt-10 scroll-mt-24">
            <h2 className="mb-4 font-display text-2xl font-bold tracking-tight">
              Os filamentos, um por um
            </h2>
            <div className="space-y-4">
              {materiais.map((m) => (
                <GuiaMaterialCard key={m.key} m={m} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {/* Seções editoriais (com um banner ilustrado no meio) */}
      {guia.secoes.map((s, idx) => (
        <Fragment key={s.id}>
          <section id={s.id} className="mt-10 scroll-mt-24">
            <h2 className="mb-3 font-display text-2xl font-bold tracking-tight">{s.titulo}</h2>
            <Markdown
              content={s.corpo}
              className="space-y-3 text-[15px] leading-relaxed text-muted-foreground [&_strong]:text-foreground"
            />
          </section>
          {idx === 1 ? (
            <Image
              src={`/guias/${guia.slug}/imagem`}
              alt={guiaDestaque(guia.slug)}
              width={1200}
              height={420}
              unoptimized
              className="mt-10 h-auto w-full rounded-2xl"
            />
          ) : null}
        </Fragment>
      ))}

      {/* FAQ */}
      <section id="faq" className="mt-12 scroll-mt-24">
        <h2 className="mb-3 font-display text-2xl font-bold tracking-tight">Perguntas frequentes</h2>
        <div className="space-y-3">
          {guia.faq.map((f) => (
            <div key={f.q} className="rounded-2xl border bg-card p-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / relacionados */}
      <section className="mt-12 rounded-2xl bg-brand-soft p-6">
        <h2 className="font-display text-xl font-semibold">Pronto para comprar?</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Agora que você sabe qual filamento usar, compare o preço real de várias
          lojas — já normalizado por preço/kg.
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {RELACIONADOS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-4" />
              </span>
              {label}
              <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/guias" className="text-sm font-medium text-teal hover:underline">
          ← Ver todos os guias
        </Link>
      </div>
    </div>
  );
}
