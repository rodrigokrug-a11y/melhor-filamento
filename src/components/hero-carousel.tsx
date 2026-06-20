"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";

import { ProductImage } from "@/components/product-image";
import type { ProductListItem } from "@/lib/catalog-types";
import { cn, formatBRL } from "@/lib/utils";

/**
 * Hero "rolante": passa automaticamente pelas melhores ofertas (cards com
 * imagem + preço), com pausa no hover e navegação por pontinhos.
 */
export function HeroCarousel({ products }: { products: ProductListItem[] }) {
  const items = products.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(
      () => setIndex((p) => (p + 1) % items.length),
      3800,
    );
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (items.length === 0) return null;
  const p = items[index];
  const perKg =
    p.kind !== "PRINTER" && p.netWeightG > 0
      ? p.bestPrice / (p.netWeightG / 1000)
      : null;

  return (
    <div
      className="relative aspect-[4/3]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        key={p.id}
        href={`/produto/${p.slug}`}
        className="group block h-full w-full duration-500 animate-in fade-in"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[28px] border bg-card shadow-lg">
          <ProductImage
            src={p.imageUrl}
            alt={`${p.name} — ${p.brandName}`}
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fallback={
              <div className="grad-mesh absolute inset-0 flex items-center justify-center">
                <Boxes className="size-16 text-white/40" />
              </div>
            }
          />
          <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-brand shadow">
            ★ Mais barato
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 text-white">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-white/80">
              {p.brandName}
            </p>
            <p className="line-clamp-1 font-display text-base font-bold">
              {p.name}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold tnum">
                {formatBRL(p.bestPrice)}
              </span>
              {perKg != null ? (
                <span className="font-mono text-xs text-white/80">
                  {formatBRL(perKg)}/kg
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      {items.length > 1 ? (
        <div className="absolute right-4 top-4 flex gap-1.5">
          {items.map((it, idx) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Ver oferta ${idx + 1} de ${items.length}`}
              onClick={() => setIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === index
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
