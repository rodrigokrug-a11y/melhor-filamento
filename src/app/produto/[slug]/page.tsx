import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, FlaskConical, Plus, Printer } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { FavoriteButton } from "@/components/favorite-button";
import { OfferComparison } from "@/components/offer-table";
import { PriceAlertForm } from "@/components/price-alert-form";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { PriceVerdict } from "@/components/price-verdict";
import { ProductImage } from "@/components/product-image";
import { RegionNotice } from "@/components/region-notice";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { Badge } from "@/components/ui/badge";
import { PRINTER_SPEC_FIELDS } from "@/lib/catalog-types";
import {
  getAllProductSlugs,
  getPriceHistory,
  getProductDetail,
} from "@/lib/catalog";
import { getProductReviews } from "@/lib/reviews";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { formatBRL } from "@/lib/utils";

// ISR: páginas de produto revalidam a cada hora.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) return { title: "Produto não encontrado" };

  const priceTxt =
    product.bestPrice != null
      ? ` a partir de ${formatBRL(product.bestPrice)}`
      : "";
  const description = `Compare preços de ${product.name} (${product.brandName})${priceTxt} entre lojas do Brasil.`;
  const path = `/produto/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: product.name,
      description,
      url: path,
      type: "website",
    },
  };
}

export default async function ProdutoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) notFound();

  const reviewData = await getProductReviews(product.id);
  const priceHistory = await getPriceHistory(product.id, 180);
  const isPrinter = product.kind === "PRINTER";
  const kindHref = isPrinter
    ? "/impressoras"
    : product.kind === "RESIN"
      ? "/resinas"
      : "/filamentos";
  const kindLabel = isPrinter
    ? "Impressoras"
    : product.kind === "RESIN"
      ? "Resinas"
      : "Filamentos";
  const Icon = isPrinter ? Printer : product.kind === "RESIN" ? FlaskConical : Boxes;
  const badgeLabel = isPrinter
    ? (product.specs?.tecnologia ?? "Impressora 3D")
    : product.materialLabel;
  const specEntries = product.specs ? Object.entries(product.specs) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageBanner placement="PRODUTO" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJsonLd(product, reviewData.summary) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: kindLabel, path: kindHref },
            { name: product.brandName, path: `/marca/${product.brandSlug}` },
            { name: product.name, path: `/produto/${product.slug}` },
          ]),
        }}
      />
      <Link
        href={kindHref}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {kindLabel}
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.4fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border">
          <ProductImage
            src={product.imageUrl}
            alt={`${product.name} — ${badgeLabel} ${product.brandName} para impressão 3D`}
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-soft to-muted">
                <Icon className="size-20 text-brand/30" />
              </div>
            }
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{badgeLabel}</Badge>
            <Link
              href={`/marca/${product.brandSlug}`}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {product.brandName}
            </Link>
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {product.name}
            </h1>
            <FavoriteButton
              slug={product.slug}
              size="lg"
              className="mt-0.5 shrink-0 border"
            />
          </div>

          {isPrinter ? (
            <div className="mt-4 rounded-2xl border bg-card">
              <p className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Especificações técnicas
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2">
                {PRINTER_SPEC_FIELDS.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-baseline justify-between gap-3 border-b px-4 py-2 text-sm sm:[&:nth-last-child(-n+2)]:border-b-0"
                  >
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-medium">
                      {product.specs?.[f.key] ?? "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Spec label="Cor" value={product.color} />
              <Spec label="Peso" value={`${product.netWeightG} g`} />
              {product.diameterMm != null ? (
                <Spec label="Diâmetro" value={`${product.diameterMm} mm`} />
              ) : null}
              {specEntries.map(([key, value]) => (
                <Spec key={key} label={key} value={String(value)} />
              ))}
            </dl>
          )}

          {product.bestPrice != null ? (
            <div className="mt-6 rounded-2xl border border-[var(--teal-100)] bg-brand-soft p-5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-teal">
                Melhor preço
              </p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight tnum">
                {formatBRL(product.bestPrice)}
              </p>
              <div className="mt-2">
                <PriceVerdict
                  bestPrice={product.bestPrice}
                  history={priceHistory}
                  months={6}
                />
              </div>
            </div>
          ) : (
            <PriceVerdict
              bestPrice={product.bestPrice}
              history={priceHistory}
              months={6}
            />
          )}
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Comparar ofertas</h2>
          <span className="text-sm text-muted-foreground">
            {product.offers.length}{" "}
            {product.offers.length === 1 ? "oferta" : "ofertas"}
          </span>
        </div>
        <div className="mb-4">
          <RegionNotice />
        </div>
        <OfferComparison offers={product.offers} />
        <div className="mt-4">
          <PriceAlertForm
            productId={product.id}
            suggestedPrice={product.bestPrice}
          />
        </div>
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed bg-brand-soft/40 p-4 sm:flex-row sm:items-center">
          <p className="text-sm">
            <span className="font-medium">Achou um preço melhor?</span>{" "}
            <span className="text-muted-foreground">
              Cadastre a oferta e ajude a comunidade.
            </span>
          </p>
          <Link
            href={`/cadastrar-oferta?productId=${product.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand/30 bg-card px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            <Plus className="size-4" />
            Cadastrar oferta
          </Link>
        </div>
      </section>

      {priceHistory.length >= 2 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Histórico de preço</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Evolução do menor preço deste produto nas lojas.
          </p>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <PriceHistoryChart points={priceHistory} />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Avaliações</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          O que a comunidade achou deste produto.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr]">
          <ReviewList
            summary={reviewData.summary}
            reviews={reviewData.reviews}
          />
          <ReviewForm productId={product.id} targetLabel={product.name} />
        </div>
      </section>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
