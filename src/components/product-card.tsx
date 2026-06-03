import Link from "next/link";
import { Boxes, FlaskConical, Megaphone, Printer, Star, Tag } from "lucide-react";

import { CompareButton } from "@/components/compare-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { materialLabel, type ProductListItem } from "@/lib/catalog-types";
import { formatBRL } from "@/lib/utils";

export function ProductCard({
  product,
  displayPrice,
  freteIncluded = false,
}: {
  product: ProductListItem;
  displayPrice?: number;
  freteIncluded?: boolean;
}) {
  const Icon =
    product.kind === "PRINTER"
      ? Printer
      : product.kind === "RESIN"
        ? FlaskConical
        : Boxes;
  const tagLabel =
    product.kind === "PRINTER"
      ? (product.tech ?? "Impressora 3D")
      : materialLabel(product.material);
  const price = displayPrice ?? product.bestPrice;
  const perKg =
    product.kind !== "PRINTER" && product.netWeightG > 0
      ? price / (product.netWeightG / 1000)
      : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-soft to-muted">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fallback={
            <Icon className="size-12 text-brand/40 transition-transform duration-300 group-hover:scale-110" />
          }
        />
        <span className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            {tagLabel}
          </Badge>
          {product.discountPct > 0 ? (
            <Badge variant="deal">
              <Tag className="size-3" />−{product.discountPct}%
            </Badge>
          ) : product.bestPriceHasCoupon ? (
            <Badge variant="deal">
              <Tag className="size-3" />
              cupom
            </Badge>
          ) : null}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.boost != null ? (
          <span className="mb-1.5 inline-flex w-fit">
            <Badge variant="best">
              <Megaphone className="size-3" />
              Patrocinado
            </Badge>
          </span>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {product.brandName}
          </p>
          {product.rating != null ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-muted-foreground">
              <Star className="size-3 fill-gold text-gold" />
              {product.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </h3>

        <div className="mt-auto pt-3">
          {product.listPrice > price + 0.01 ? (
            <p className="text-[11px] text-muted-foreground line-through tnum">
              {formatBRL(product.listPrice)}
            </p>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {freteIncluded ? "menor total" : "a partir de"}
            </p>
          )}
          <div className="flex items-end justify-between gap-2">
            <p className="font-display text-xl font-bold tracking-tight tnum">
              {formatBRL(price)}
            </p>
            <p className="shrink-0 font-mono text-[10px] text-muted-foreground">
              {product.offerCount}{" "}
              {product.offerCount === 1 ? "oferta" : "ofertas"}
            </p>
          </div>
          {freteIncluded ? (
            <p className="text-[11px] font-medium text-offer">com frete</p>
          ) : perKg != null ? (
            <p className="font-mono text-[10px] text-muted-foreground tnum">
              {formatBRL(perKg)}/kg
            </p>
          ) : null}
        </div>
      </div>

      {/* Link cobrindo o card (atrás dos botões interativos). */}
      <Link
        href={`/produto/${product.slug}`}
        aria-label={product.name}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <FavoriteButton
        slug={product.slug}
        className="absolute right-2.5 top-2.5 z-20"
      />
      <CompareButton
        slug={product.slug}
        kind={product.kind}
        className="absolute right-12 top-2.5 z-20"
      />
    </article>
  );
}
