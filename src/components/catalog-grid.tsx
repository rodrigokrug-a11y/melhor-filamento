"use client";

import { useMemo } from "react";

import { ProductCard } from "@/components/product-card";
import { useRegion } from "@/components/use-region";
import type { CatalogSort, ProductListItem } from "@/lib/catalog-types";
import { estimateShipping, totalForRegion } from "@/lib/shipping";

type DisplayProduct = ProductListItem & {
  displayPrice: number;
  freteIncluded: boolean;
};

export function CatalogGrid({
  products,
  sort,
}: {
  products: ProductListItem[];
  sort: CatalogSort;
}) {
  const { region } = useRegion();

  const items = useMemo<DisplayProduct[]>(() => {
    const uf = region?.uf ?? null;

    const mapped: DisplayProduct[] = products.map((p) => {
      if (!uf) {
        return { ...p, displayPrice: p.bestPrice, freteIncluded: false };
      }
      let best = Infinity;
      for (const offer of p.offers) {
        const shipping = estimateShipping(
          offer.shippingRules,
          uf,
          offer.effectivePrice,
        );
        const total = totalForRegion(offer.effectivePrice, shipping);
        if (total < best) best = total;
      }
      return {
        ...p,
        displayPrice: Number.isFinite(best) ? best : p.bestPrice,
        freteIncluded: true,
      };
    });

    if (uf && (sort === "preco-asc" || sort === "preco-desc")) {
      mapped.sort((a, b) =>
        sort === "preco-desc"
          ? b.displayPrice - a.displayPrice
          : a.displayPrice - b.displayPrice,
      );
    }
    return mapped;
  }, [products, sort, region]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          displayPrice={p.displayPrice}
          freteIncluded={p.freteIncluded}
        />
      ))}
    </div>
  );
}
