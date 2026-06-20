import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Boxes, Crown, FlaskConical, Thermometer, Truck } from "lucide-react";

import { ProductImage } from "@/components/product-image";
import { getCatalog } from "@/lib/catalog";
import {
  FILAMENT_MATERIALS,
  MATERIAL_INFO,
  materialLabel,
  type ProductKind,
} from "@/lib/catalog-types";
import { siteUrl } from "@/lib/seo";
import { formatBRL } from "@/lib/utils";

export const revalidate = 3600;

const YEAR = 2026;

type Cfg = {
  kind: ProductKind;
  material: string | null;
  label: string; // ex.: "PLA", "resina 3D"
  unit: "kg" | "un";
};

function resolve(slug: string): Cfg | null {
  if (slug === "resina") return { kind: "RESIN", material: null, label: "resina 3D", unit: "un" };
  const upper = slug.toUpperCase();
  if ((FILAMENT_MATERIALS as readonly string[]).includes(upper))
    return {
      kind: "FILAMENT",
      material: upper,
      label: materialLabel(upper),
      unit: "kg",
    };
  return null;
}

export function generateStaticParams() {
  return [
    ...FILAMENT_MATERIALS.map((m) => ({ material: m.toLowerCase() })),
    { material: "resina" },
  ];
}

async function rank(cfg: Cfg) {
  const { products } = await getCatalog(
    cfg.kind,
    cfg.material ? { materials: [cfg.material] } : {},
  );
  return products
    .filter((p) => p.bestPrice > 0)
    .map((p) => ({
      ...p,
      perKg: cfg.unit === "kg" && p.netWeightG > 0 ? p.bestPrice / (p.netWeightG / 1000) : null,
    }))
    .sort((a, b) =>
      cfg.unit === "kg" ? (a.perKg ?? Infinity) - (b.perKg ?? Infinity) : a.bestPrice - b.bestPrice,
    )
    .slice(0, 12);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ material: string }>;
}): Promise<Metadata> {
  const { material } = await params;
  const cfg = resolve(material);
  if (!cfg) return {};
  const title = `Melhor ${cfg.label} do Brasil: preços e ranking ${YEAR}`;
  const description = `Ranking das ofertas mais baratas de ${cfg.label} no Brasil${cfg.unit === "kg" ? ", por preço/kg" : ""} — preço real de várias lojas, com frete estimado para o seu CEP.`;
  // canonical sempre em minúsculas: /melhor/PLA e /melhor/pla resolvem 200,
  // mas só a forma minúscula (do generateStaticParams) deve ser indexada.
  const canon = `/melhor/${material.toLowerCase()}`;
  return {
    title,
    description,
    alternates: { canonical: canon },
    openGraph: { title, description, url: canon, type: "website" },
  };
}

export default async function MelhorPage({ params }: { params: Promise<{ material: string }> }) {
  const { material: slug } = await params;
  const cfg = resolve(slug);
  if (!cfg) notFound();

  const items = await rank(cfg);
  const info = cfg.material ? MATERIAL_INFO[cfg.material] : null;
  const cheapest = items[0] ?? null;
  const base = siteUrl();
  const FallbackIcon = cfg.kind === "RESIN" ? FlaskConical : Boxes;

  const unitPrice = (p: (typeof items)[number]) =>
    cfg.unit === "kg" && p.perKg != null ? `${formatBRL(p.perKg)}/kg` : formatBRL(p.bestPrice);

  const faq: { q: string; a: string }[] = [
    {
      q: `Qual o ${cfg.label} mais barato hoje?`,
      a: cheapest
        ? `No nosso ranking, o mais barato agora é ${cheapest.name} (${cheapest.brandName}), a partir de ${formatBRL(cheapest.bestPrice)}${cheapest.perKg != null ? ` — ${formatBRL(cheapest.perKg)}/kg` : ""}.`
        : `Estamos atualizando as ofertas de ${cfg.label}. Volte em breve.`,
    },
    ...(info
      ? [
          {
            q: `Qual a temperatura para imprimir ${cfg.label}?`,
            a: `Em geral, bico ${info.nozzle} e mesa ${info.bed}. ${info.description}`,
          },
        ]
      : []),
    {
      q: `Onde comprar ${cfg.label} barato no Brasil?`,
      a: `Compare aqui o preço de ${cfg.label} de várias lojas brasileiras${cfg.unit === "kg" ? ", já normalizado por preço/kg" : ""}, com o frete estimado para o seu CEP — e clique direto na oferta mais barata.`,
    },
  ];

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `Melhor ${cfg.label} do Brasil`,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: items.length,
        itemListElement: items.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${base}/produto/${p.slug}`,
          name: p.name,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  }).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/filamentos" className="hover:text-foreground">
          {cfg.kind === "RESIN" ? "Resinas" : "Filamentos"}
        </Link>{" "}
        / <span className="text-foreground">Melhor {cfg.label}</span>
      </nav>

      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Melhor {cfg.label} do Brasil{" "}
        <span className="text-muted-foreground">— ranking de preços {YEAR}</span>
      </h1>

      <p className="mt-3 max-w-2xl text-muted-foreground">
        {info ? `${info.description} ` : ""}
        Abaixo está o ranking das ofertas mais baratas de {cfg.label}
        {cfg.unit === "kg" ? ", ordenado por preço por quilo" : ", por preço"} — com o preço real de
        várias lojas e o frete estimado para o seu CEP.
        {cheapest ? ` Hoje, o mais barato sai por ${unitPrice(cheapest)}.` : ""}
      </p>

      {info ? (
        <div className="mt-4 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border bg-muted/40 px-4 py-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Thermometer className="size-4 text-brand" /> Bico {info.nozzle}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Thermometer className="size-4 text-offer" /> Mesa {info.bed}
          </span>
        </div>
      ) : null}

      {/* Ranking */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          Ranking — {cfg.label} mais barato
          {cfg.unit === "kg" ? " por kg" : ""}
        </h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            Ainda estamos reunindo ofertas de {cfg.label}. Volte em breve.
          </div>
        ) : (
          <ol className="space-y-2">
            {items.map((p, i) => (
              <li key={p.id}>
                <Link
                  href={`/produto/${p.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:gap-4"
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tnum ${
                      i === 0 ? "bg-brand text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i === 0 ? <Crown className="size-4" /> : i + 1}
                  </span>
                  <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    <ProductImage
                      src={p.imageUrl}
                      alt={p.name}
                      sizes="48px"
                      className="object-contain p-1"
                      fallback={<FallbackIcon className="size-5 text-brand/40" />}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.brandName} · {p.offerCount} {p.offerCount === 1 ? "oferta" : "ofertas"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-base font-bold tnum">{unitPrice(p)}</p>
                    {cfg.unit === "kg" ? (
                      <p className="text-[11px] text-muted-foreground tnum">
                        {formatBRL(p.bestPrice)} · {p.netWeightG} g
                      </p>
                    ) : null}
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Truck className="size-3.5 text-teal" />
          Informe seu CEP no topo do site para ordenar pelo custo total com frete. Ranking por preço
          real — atualizado automaticamente.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Perguntas frequentes</h2>
        <div className="space-y-3">
          {faq.map((f) => (
            <div key={f.q} className="rounded-2xl border bg-card p-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href={cfg.kind === "RESIN" ? "/resinas" : "/filamentos"}
          className="font-medium text-teal hover:underline"
        >
          Ver todos os {cfg.kind === "RESIN" ? "resinas" : "filamentos"} →
        </Link>
        {cfg.material ? (
          <Link href={`/dica/${cfg.material}`} className="font-medium text-teal hover:underline">
            Como imprimir {cfg.label} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
