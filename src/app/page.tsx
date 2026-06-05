import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Flame,
  FlaskConical,
  Lightbulb,
  MapPin,
  Megaphone,
  Printer,
  Scale,
  Search,
  Sparkles,
  Trophy,
  Truck,
  Wrench,
} from "lucide-react";

import { HeroAd, PageBanner } from "@/components/banners";
import { BrandLogo } from "@/components/brand-logo";
import { CatStrip } from "@/components/cat-strip";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Reveal } from "@/components/reveal";
import { SearchBox } from "@/components/search-box";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { getBrandsOverview, getCatalog, getProductCardById } from "@/lib/catalog";
import {
  type BrandSummary,
  MATERIAL_INFO,
  materialLabel,
  type ProductListItem,
} from "@/lib/catalog-types";
import { getRanking } from "@/lib/reviews";
import { type ActiveBanner, getActiveBanner } from "@/lib/banners";
import { getMaterialsOverview } from "@/lib/tips";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

// ISR: revalida a home periodicamente (anúncios e preços atualizam sem
// redeploy). O admin também chama revalidatePath("/") ao salvar banners.
export const revalidate = 300;

export default async function HomePage() {
  const [filamentos, resinas, brands, ranking, materials, heroAd] =
    await Promise.all([
      getCatalog("FILAMENT", { sort: "preco-asc" }),
      getCatalog("RESIN", { sort: "preco-asc" }),
      getBrandsOverview(),
      getRanking(),
      getMaterialsOverview(),
      getActiveBanner("HERO"),
    ]);
  const featuredBrands = brands.filter((b) => b.productCount > 0).slice(0, 8);
  const topRanking = ranking.slice(0, 3);
  const topMaterials = materials.slice(0, 6);
  // Display do hero: produto escolhido pelo admin (se houver) tem prioridade.
  const featuredProduct = heroAd?.productId
    ? await getProductCardById(heroAd.productId)
    : null;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <PageBanner placement="HOME" />
      </div>
      <CatStrip />
      <Hero
        cheapest={filamentos.products[0]}
        ad={heroAd}
        featured={featuredProduct}
      />
      <TrustBar />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        <Reveal>
          <FeatureBlocks />
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

function Hero({
  cheapest,
  ad,
  featured,
}: {
  cheapest?: ProductListItem;
  ad?: ActiveBanner | null;
  featured?: ProductListItem | null;
}) {
  const perKg =
    cheapest && cheapest.netWeightG > 0
      ? cheapest.bestPrice / (cheapest.netWeightG / 1000)
      : null;
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

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 duration-700 animate-in fade-in slide-in-from-bottom-4 sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <p className="eyebrow">
            Compare. Descubra.{" "}
            <span className="text-offer">Compre melhor.</span>
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            O melhor preço em{" "}
            <span className="bg-gradient-to-r from-brand to-offer bg-clip-text text-transparent">
              filamento e resina 3D
            </span>{" "}
            do Brasil
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground sm:text-lg lg:mx-0">
            Compare ofertas de várias lojas com o frete pro seu CEP — e use as
            ferramentas do site (inclusive IA) pra imprimir com mais sucesso.
          </p>
          <div className="mx-auto mt-6 max-w-xl text-left lg:mx-0">
            <SearchBox
              size="lg"
              placeholder="Ex: PLA preto 1kg, resina, Ender 3…"
            />
          </div>
          <div className="mx-auto mt-3 flex max-w-xl flex-wrap justify-center gap-2 lg:mx-0 lg:justify-start">
            {[
              { label: "PLA 1kg", href: "/filamentos?material=PLA" },
              { label: "PETG", href: "/filamentos?material=PETG" },
              { label: "ABS", href: "/filamentos?material=ABS" },
              { label: "Resinas", href: "/resinas" },
              { label: "Ender 3", href: "/busca?q=Ender+3" },
            ].map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="rounded-full border bg-card px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
              >
                {t.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground lg:justify-start">
            <MapPin className="size-3.5 text-brand" />
            Informe seu CEP no topo para ranquear pelo custo total com frete.
          </p>
        </div>

        {/* Display: imagem-anúncio > produto destacado (admin) > visual padrão */}
        <div className="hidden md:block">
          {ad && ad.imageUrl ? (
            <HeroAd banner={ad} />
          ) : featured ? (
            <HeroProduct product={featured} />
          ) : (
            <div className="grad-mesh relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[28px] shadow-lg">
            <div
              aria-hidden
              className="size-[62%] rounded-full [background:repeating-radial-gradient(circle,rgba(255,255,255,0.08)_0_6px,transparent_6px_12px)]"
            />
            {cheapest ? (
              <Link
                href={`/produto/${cheapest.slug}`}
                className="absolute right-5 top-5 rounded-2xl bg-card p-3 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  Melhor preço
                </p>
                <p className="font-display text-xl font-bold tnum">
                  {formatBRL(cheapest.bestPrice)}
                </p>
                {perKg != null ? (
                  <p className="font-mono text-[10px] font-bold text-accent-text">
                    {formatBRL(perKg)}/kg
                  </p>
                ) : null}
              </Link>
            ) : null}
              <div className="absolute bottom-5 left-5">
                <Badge variant="best">★ Melhor compra</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Display do hero quando o admin escolhe um produto: imagem + preço + link.
function HeroProduct({ product }: { product: ProductListItem }) {
  const perKg =
    product.kind !== "PRINTER" && product.netWeightG > 0
      ? product.bestPrice / (product.netWeightG / 1000)
      : null;
  return (
    <Link href={`/produto/${product.slug}`} className="group block aspect-[4/3]">
      <div className="relative h-full w-full overflow-hidden rounded-[28px] border bg-card shadow-lg">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          fallback={
            <div className="grad-mesh absolute inset-0 flex items-center justify-center">
              <Boxes className="size-16 text-white/40" />
            </div>
          }
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 pt-12 text-white">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-white/80">
            {product.brandName}
          </p>
          <p className="line-clamp-1 font-display text-base font-bold">
            {product.name}
          </p>
          <p className="mt-0.5 font-display text-2xl font-bold tnum">
            {formatBRL(product.bestPrice)}
            {perKg != null ? (
              <span className="ml-2 font-mono text-xs font-normal text-white/80">
                {formatBRL(perKg)}/kg
              </span>
            ) : null}
          </p>
        </div>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
          <Megaphone className="size-3" />
          Anúncio
        </span>
      </div>
    </Link>
  );
}

function TrustBar() {
  const items = [
    { icon: <Scale />, text: "Compare preço por kg e custo total" },
    { icon: <Truck />, text: "Frete estimado pro seu CEP" },
    { icon: <BadgeCheck />, text: "Ofertas de várias lojas do Brasil" },
    { icon: <MapPin />, text: "100% nacional" },
  ];
  return (
    <div className="bg-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3.5">
        {items.map((it) => (
          <span
            key={it.text}
            className="inline-flex items-center gap-2 font-mono text-xs text-[#9fc0bc] [&_svg]:size-4 [&_svg]:text-[var(--teal-300)]"
          >
            {it.icon}
            {it.text}
          </span>
        ))}
      </div>
    </div>
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

function FeatureBlocks() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* IA — destaque principal */}
        <Link
          href="/ia"
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-[#06201f] p-6 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
            <Sparkles className="size-3.5" /> Novo · Ferramentas de IA
          </span>
          <h3 className="mt-3 font-display text-xl font-bold">
            Assistente e diagnóstico por foto
          </h3>
          <p className="mt-1.5 flex-1 text-sm text-slate-300">
            Tire dúvidas de impressão com a IA e mande a foto de uma peça com
            problema pra descobrir a causa e como resolver.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
            Explorar a IA
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        {/* Comparar preços — destaque */}
        <Link
          href="/comparar"
          className="group grad-brand relative flex flex-col overflow-hidden rounded-2xl p-6 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
            <Scale className="size-3.5" /> Comparador de preços
          </span>
          <h3 className="mt-3 font-display text-xl font-bold">
            Compare filamentos e resinas lado a lado
          </h3>
          <p className="mt-1.5 flex-1 text-sm text-white/90">
            Ofertas de várias lojas num lugar só, já com o frete estimado pro
            seu CEP. Pague menos no total.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
            Comparar agora
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MiniBlock href="/ofertas" icon={<Flame />} label="Ofertas" />
        <MiniBlock href="/filamentos" icon={<Boxes />} label="Filamentos" />
        <MiniBlock href="/resinas" icon={<FlaskConical />} label="Resinas" />
        <MiniBlock href="/impressoras" icon={<Printer />} label="Impressoras" />
        <MiniBlock href="/ranking" icon={<Trophy />} label="Ranking" />
        <MiniBlock href="/ferramentas" icon={<Wrench />} label="Ferramentas" />
      </div>
    </section>
  );
}

function MiniBlock({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition-transform group-hover:scale-105 [&_svg]:size-5">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
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
          <Trophy className="size-5 text-gold" />
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
          <Lightbulb className="size-5 text-gold" />
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
      <div className="grad-dark relative overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]"
        />
        <div className="relative">
          <BadgeCheck className="mx-auto size-9" />
          <h2 className="mx-auto mt-3 max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Pronto para pagar menos na sua próxima impressão?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[#bcd3d0]">
            Compare preços com frete por CEP e veja as ofertas de lojas
            verificadas.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/filamentos"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-teal shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver filamentos <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/comparar"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Comparar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
