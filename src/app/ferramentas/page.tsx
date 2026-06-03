import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Wrench } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { TOOLS } from "@/lib/tools";

const description =
  "Mini-ferramentas grátis para impressão 3D: calculadora de custo e mais. Tudo roda no seu navegador.";

export const metadata: Metadata = {
  title: "Ferramentas para impressão 3D",
  description,
  alternates: { canonical: "/ferramentas" },
  openGraph: {
    title: "Ferramentas para impressão 3D",
    description,
    url: "/ferramentas",
    type: "website",
  },
};

export default function FerramentasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageBanner placement="GLOBAL" />
      <PageHeader
        icon={Wrench}
        eyebrow="Caixa de ferramentas"
        title="Ferramentas para impressão 3D"
        subtitle="Mini-ferramentas grátis pra te ajudar no dia a dia da impressão 3D. Tudo roda no seu navegador. Novas ferramentas chegam com o tempo."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          if (!t.available) {
            return (
              <div
                key={t.slug}
                className="flex flex-col rounded-2xl border border-dashed bg-card/50 p-5 opacity-70"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-semibold">
                    {t.name}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
                <span className="mt-3 text-xs font-medium text-muted-foreground">
                  Em breve
                </span>
              </div>
            );
          }
          if (t.externalUrl) {
            const host = new URL(t.externalUrl).host.replace(/^www\./, "");
            return (
              <a
                key={t.slug}
                href={t.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-semibold">
                    {t.name}
                  </h2>
                  <ExternalLink className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
                <span className="mt-2 text-xs font-medium text-brand">
                  Abre em {host} ↗
                </span>
              </a>
            );
          }
          return (
            <Link
              key={t.slug}
              href={`/ferramentas/${t.slug}`}
              className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-display text-lg font-semibold">{t.name}</h2>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
