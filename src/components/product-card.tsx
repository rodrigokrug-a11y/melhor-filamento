import Link from "next/link";
import { Boxes, FlaskConical, Printer, Tag } from "lucide-react";

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

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-lg group-hover:shadow-brand/5">
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
          <span className="absolute left-2.5 top-2.5">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              {tagLabel}
            </Badge>
          </span>
          {product.bestPriceHasCoupon ? (
            <span className="absolute right-2.5 top-2.5">
              <Badge variant="success" className="gap-1">
                <Tag className="size-3" />
                cupom
              </Badge>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {product.brandName}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {freteIncluded ? "menor total" : "a partir de"}
              </p>
              <p className="font-display text-lg font-bold tnum">
                {formatBRL(price)}
              </p>
              {freteIncluded ? (
                <p className="text-[11px] font-medium text-offer">com frete</p>
              ) : null}
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              {product.offerCount}{" "}
              {product.offerCount === 1 ? "oferta" : "ofertas"}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
