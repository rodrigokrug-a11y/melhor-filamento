import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Globe,
  MapPin,
  Megaphone,
  ShoppingBag,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { BrandRequestButton } from "@/components/brand-request-button";
import { CatalogGrid } from "@/components/catalog-grid";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { Badge } from "@/components/ui/badge";
import { getAllBrandSlugs, getBrandWithProducts } from "@/lib/catalog";
import { getBrandReviews } from "@/lib/reviews";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandWithProducts(slug);
  if (!brand) return { title: "Marca não encontrada" };

  const description = `Veja os produtos da marca ${brand.name} e compare preços entre lojas do Brasil.`;
  const path = `/marca/${slug}`;
  return {
    title: brand.name,
    description,
    alternates: { canonical: path },
    openGraph: { title: brand.name, description, url: path, type: "website" },
  };
}

export default async function MarcaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = await getBrandWithProducts(slug);
  if (!brand) notFound();

  const reviewData = await getBrandReviews(brand.id);
  const { profile } = brand;
  const sede = [profile.headquarters, profile.country].filter(Boolean).join(" · ");
  const hasProfile = Boolean(
    profile.summary ||
      profile.about ||
      profile.sells ||
      sede ||
      profile.website ||
      profile.foundedYear,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: `${siteUrl()}/marca/${brand.slug}`,
    ...(brand.logoUrl ? { logo: brand.logoUrl } : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/marcas"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Marcas
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size={64} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
            {brand.promotedActive ? (
              <Badge className="gap-1">
                <Megaphone className="size-3" />
                Patrocinada
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {brand.products.length}{" "}
            {brand.products.length === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </div>

      {hasProfile ? (
        <section className="mb-8 rounded-2xl border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sobre a empresa
          </h2>
          {profile.summary ? (
            <p className="mt-2 text-base font-medium">{profile.summary}</p>
          ) : null}
          {profile.about ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {profile.about}
            </p>
          ) : null}
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.sells ? (
              <Fact icon={ShoppingBag} label="O que vende" value={profile.sells} />
            ) : null}
            {sede ? <Fact icon={MapPin} label="Sede" value={sede} /> : null}
            {profile.foundedYear ? (
              <Fact
                icon={Calendar}
                label="Fundada em"
                value={String(profile.foundedYear)}
              />
            ) : null}
            {profile.website ? (
              <Fact
                icon={Globe}
                label="Site"
                value={
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-teal hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                }
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      <div className="mb-8 rounded-2xl border border-brand/20 bg-brand-soft p-4">
        <p className="text-sm font-medium">Quer ofertas da {brand.name}?</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Peça e a gente busca as melhores ofertas dessa marca pra você — e avisa
          quando tiver.
        </p>
        <BrandRequestButton brandId={brand.id} brandName={brand.name} />
      </div>

      {brand.products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Esta marca ainda não tem ofertas no comparador — use o botão acima para
          pedir.
        </div>
      ) : (
        <CatalogGrid products={brand.products} sort="preco-asc" />
      )}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Avaliações da marca</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          O que a comunidade acha da {brand.name}.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr]">
          <ReviewList
            summary={reviewData.summary}
            reviews={reviewData.reviews}
          />
          <ReviewForm brandId={brand.id} targetLabel={brand.name} />
        </div>
      </section>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
