"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import type { ProductListItem } from "@/lib/catalog-types";
import { useFavorites } from "@/lib/use-favorites";

export function FavoritesView() {
  const slugs = useFavorites();
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (slugs.length === 0) return;
    let cancelled = false;
    const ctrl = new AbortController();
    fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
        setLoaded(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [slugs]);

  if (slugs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Heart className="size-6" />
        </span>
        <p className="mt-3 font-medium">Você ainda não salvou nenhum produto</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Toque no coração de qualquer produto para salvá-lo aqui e acompanhar o
          preço.
        </p>
        <Link
          href="/filamentos"
          className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline"
        >
          Explorar filamentos →
        </Link>
      </div>
    );
  }

  // Reflete remoções instantâneas mantendo a ordem dos favoritos.
  const order = new Map(slugs.map((s, i) => [s, i]));
  const visible = items
    .filter((p) => order.has(p.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));

  if (!loaded) {
    return (
      <p className="text-sm text-muted-foreground">Carregando favoritos…</p>
    );
  }

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Os produtos salvos não têm ofertas ativas no momento.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {visible.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
