import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  FlaskConical,
  Lightbulb,
  MapPin,
  Megaphone,
  Search,
  Sparkles,
  Trophy,
  Truck,
} from "lucide-react";

import { HomeBanner } from "@/components/banners";
import { BrandLogo } from "@/components/brand-logo";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Stars } from "@/components/stars";
import { buttonVariants } from "@/components/ui/button";
import { getBrandsOverview, getCatalog } from "@/lib/catalog";
import {
  type BrandSummary,
  MATERIAL_INFO,
  materialLabel,
  type ProductListItem,
} from "@/lib/catalog-types";
import { getRanking } from "@/lib/reviews";
import { getMaterialsOverview } from "@/lib/tips";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function HomePage() {
  const [filamentos, resinas, brands, ranking, materials] = await Promise.all([
    getCatalog("FILAMENT", { sort: "preco-asc" }),
    getCatalog("RESIN", { sort: "preco-asc" }),
    getBrandsOverview(),
    getRanking(),
    getMaterialsOverview(),
  ]);
  const featuredBrands = brands.filter((b) => b.productCount > 0).slice(0, 8);
  const topRanking = ranking.slice(0, 3);
  const topMaterials = materials.slice(0, 6);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        <HomeBanner />
        <Reveal>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CategoryCard
              href="/filamentos"
              icon={<Boxes />}
              title="Filamentos"
              desc="PLA, PETG, ABS, TPU, ASA e mais."
            />
            <CategoryCard
              href="/resinas"
              icon={<FlaskConical />}
              title="Resinas"
              desc="Standard, Tough e laváveis em água."
            />
          </section>
        </Reveal>

        <Reveal>
          <HowItWorks />
        </Reveal>

        <Reveal>
          <BrandsSection brands={featuredBrands} />
        </Reveal>

        <Reveal>
          <Rail
            title="Filamentos mais baratos"
            href="/filamentos"
            products={filamentos.products.slice(0, 4)}
          />
        </Reveal>
        <Reveal>
          <Rail
            title="Resinas mais baratas"
            href="/resinas"
            products={resinas.products.slice(0, 4)}
          />
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RankingTeaser items={topRanking} />
            <DicasTeaser materials={topMaterials} />
          </div>
        </Reveal>
      </div>

      <Reveal>
        <CtaBand />
      </Reveal>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-soft/70 via-background to-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-10 -z-10 size-72 rounded-full bg-teal/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      <div className="mx-auto max-w-4xl px-4 py-20 text-center duration-700 animate-in fade-in slide-in-from-bottom-4 sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-brand" />
          Comparador de impressão 3D · Brasil
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          O melhor preço em{" "}
          <span className="bg-gradient-to-r from-brand to-[#ff8a4c] bg-clip-text text-transparent">
            filamento e resina 3D
          </span>{" "}
          do Brasil
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
          Compare ofertas de várias lojas em um só lugar, com o frete estimado
          para o seu CEP. Pague menos no total e imprima com mais sucesso.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/filamentos" className={cn(buttonVariants({ size: "lg" }))}>
            Ver filamentos <ArrowRight />
          </Link>
          <Link
            href="/comparar"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Comparar preços
          </Link>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-brand" />
          Informe seu CEP no topo para ranquear pelo custo total com frete.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <Search />,
      title: "Escolha o produto",
      desc: "Filtre por material e marca e ache o filamento ou resina ideal.",
    },
    {
      icon: <MapPin />,
      title: "Informe seu CEP",
      desc: "Calculamos o frete por região e ordenamos pelo custo total.",
    },
    {
      icon: <Truck />,
      title: "Compre mais barato",
      desc: "Vá direto à loja com a melhor oferta — sem pagar a mais.",
    },
  ];
  return (
    <section>
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
        Como funciona
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="relative rounded-2xl border bg-card p-5 shadow-sm"
          >
            <span className="absolute right-4 top-4 font-display text-3xl font-bold text-brand/15">
              {i + 1}
            </span>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand [&_svg]:size-5">
              {s.icon}
            </span>
            <h3 className="mt-4 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandsSection({ brands }: { brands: BrandSummary[] }) {
  if (brands.length === 0) return null;
  return (
    <section>
      <SectionHeading title="Marcas" href="/marcas" linkLabel="Ver todas" />
      <div className="flex flex-wrap gap-3">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/marca/${b.slug}`}
            className="group flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
          >
            <BrandLogo name={b.name} logoUrl={b.logoUrl} size={32} />
            <span className="text-sm font-medium">{b.name}</span>
            {b.promotedActive ? (
              <Megaphone className="size-3.5 text-brand" />
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-transform group-hover:scale-105 [&_svg]:size-7">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-display text-lg font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
      <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        {linkLabel} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function Rail({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: ProductListItem[];
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <SectionHeading title={title} href={href} linkLabel="Ver todos" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function RankingTeaser({
  items,
}: {
  items: {
    id: string;
    slug: string;
    name: string;
    brandName: string;
    material: string;
    average: number;
    count: number;
  }[];
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Trophy className="size-5 text-amber-500" />
          Mais bem avaliados
        </h2>
        <Link
          href="/ranking"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Ranking <ArrowRight className="size-4" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não há avaliações. Seja o primeiro a avaliar um filamento!
        </p>
      ) : (
        <ol className="space-y-2">
          {items.map((it, i) => (
            <li key={it.id}>
              <Link
                href={`/produto/${it.slug}`}
                className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-accent"
              >
                <span className="w-5 text-center font-display font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {it.brandName} · {materialLabel(it.material)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Stars value={it.average} size={13} />
                  <span className="text-sm font-semibold tnum">
                    {it.average.toFixed(1)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DicasTeaser({
  materials,
}: {
  materials: { material: string; tipCount: number }[];
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Lightbulb className="size-5 text-amber-500" />
          Dicas e tutoriais
        </h2>
        <Link
          href="/dicas"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Ver todas <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {materials.map((m) => {
          const info = MATERIAL_INFO[m.material];
          return (
            <Link
              key={m.material}
              href={`/dica/${m.material}`}
              className="rounded-xl border p-3 transition-colors hover:border-brand/40 hover:bg-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{materialLabel(m.material)}</span>
                <span className="text-xs text-muted-foreground">
                  {m.tipCount} {m.tipCount === 1 ? "dica" : "dicas"}
                </span>
              </div>
              {info ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Bico {info.nozzle}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 text-center text-brand-foreground sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]"
        />
        <div className="relative">
          <BadgeCheck className="mx-auto size-9" />
          <h2 className="mx-auto mt-3 max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Pronto para pagar menos na sua próxima impressão?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-brand-foreground/90">
            Compare preços com frete por CEP e veja as ofertas de lojas
            verificadas.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/filamentos"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-7 text-base font-medium text-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver filamentos <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/comparar"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-brand-foreground/40 px-7 text-base font-medium transition-colors hover:bg-brand-foreground/10"
            >
              Comparar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
