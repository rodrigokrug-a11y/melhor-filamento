"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Search, Store, Trash2 } from "lucide-react";

import { ToolField, parseNum } from "@/components/tool-ui";
import { formatBRL } from "@/lib/utils";

type Offer = { store: string; price: number };
export type CartProduct = {
  id: string;
  name: string;
  brand: string;
  offers: Offer[];
};

export function CartOptimizer({ products }: { products: CartProduct[] }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [frete, setFrete] = useState("25");

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          !cart.some((c) => c.id === p.id) &&
          (p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [query, products, cart]);

  function add(id: string) {
    setCart((c) => [...c, { id, qty: 1 }]);
    setQuery("");
  }
  function setQty(id: string, qty: number) {
    setCart((c) =>
      c.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x)),
    );
  }
  function remove(id: string) {
    setCart((c) => c.filter((x) => x.id !== id));
  }

  const items = cart
    .map((c) => ({ prod: byId.get(c.id), qty: c.qty }))
    .filter((x): x is { prod: CartProduct; qty: number } => Boolean(x.prod));

  const fr = parseNum(frete);

  // Estratégia 1: cada item na loja mais barata (soma + frete por loja distinta).
  let splitItems = 0;
  const splitStores = new Set<string>();
  for (const { prod, qty } of items) {
    const cheapest = prod.offers[0];
    if (!cheapest) continue;
    splitItems += cheapest.price * qty;
    splitStores.add(cheapest.store);
  }
  const splitTotal = splitItems + fr * splitStores.size;

  // Estratégia 2: tudo numa loja só (que tenha todos os itens).
  const allStores = new Set<string>();
  for (const { prod } of items)
    for (const o of prod.offers) allStores.add(o.store);
  let bestStore: { store: string; total: number } | null = null;
  for (const store of allStores) {
    let sum = 0;
    let hasAll = true;
    for (const { prod, qty } of items) {
      const o = prod.offers.find((x) => x.store === store);
      if (!o) {
        hasAll = false;
        break;
      }
      sum += o.price * qty;
    }
    if (hasAll) {
      const total = sum + fr;
      if (!bestStore || total < bestStore.total) bestStore = { store, total };
    }
  }

  const recommended =
    bestStore && bestStore.total < splitTotal ? "single" : "split";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto pra adicionar à cesta…"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {matches.length > 0 ? (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
                {matches.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => add(p.id)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="min-w-0 truncate">
                      {p.name}{" "}
                      <span className="text-muted-foreground">· {p.brand}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatBRL(p.offers[0].price)}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Busque e adicione produtos pra montar sua cesta.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map(({ prod, qty }) => (
                <li key={prod.id} className="flex items-center gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{prod.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {prod.brand} · {prod.offers.length}{" "}
                      {prod.offers.length === 1 ? "loja" : "lojas"} · a partir de{" "}
                      {formatBRL(prod.offers[0].price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQty(prod.id, qty - 1)}
                      className="flex size-10 items-center justify-center rounded-md sm:size-7 border hover:bg-accent"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(prod.id, qty + 1)}
                      className="flex size-10 items-center justify-center rounded-md sm:size-7 border hover:bg-accent"
                    >
                      <Plus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(prod.id)}
                      aria-label="Remover"
                      className="ml-1 flex size-10 items-center justify-center rounded-md sm:size-7 text-muted-foreground hover:bg-accent hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <ToolField
            label="Frete médio por loja"
            value={frete}
            onChange={setFrete}
            suffix="R$"
            hint="Estimativa por loja — comprar em menos lojas economiza frete."
          />
        </section>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Store className="size-4 text-brand" />
            Melhor jeito de comprar
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Adicione itens à cesta pra ver a melhor combinação.
            </p>
          ) : (
            <>
              <div
                className={`rounded-xl border p-4 ${
                  recommended === "single"
                    ? "border-brand bg-brand-soft/50"
                    : ""
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tudo numa loja só
                  {recommended === "single" ? " · melhor 🏆" : ""}
                </p>
                {bestStore ? (
                  <>
                    <p className="mt-1 font-display text-xl font-bold tabular-nums">
                      {formatBRL(bestStore.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      na {bestStore.store} (1 frete)
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nenhuma loja tem todos os itens.
                  </p>
                )}
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  recommended === "split" ? "border-brand bg-brand-soft/50" : ""
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cada um mais barato
                  {recommended === "split" ? " · melhor 🏆" : ""}
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">
                  {formatBRL(splitTotal)}
                </p>
                <p className="text-sm text-muted-foreground">
                  em {splitStores.size}{" "}
                  {splitStores.size === 1 ? "loja" : "lojas"} (
                  {splitStores.size} frete{splitStores.size === 1 ? "" : "s"})
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Estimativa com frete médio. Confira o frete real pelo seu CEP em
                cada loja.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
