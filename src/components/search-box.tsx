"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type Suggestion = {
  slug: string;
  name: string;
  brandName: string;
  kind: "FILAMENT" | "RESIN" | "PRINTER";
};

const kindLabel = (k: Suggestion["kind"]) =>
  k === "PRINTER" ? "Impressora" : k === "RESIN" ? "Resina" : "Filamento";

export function SearchBox({
  defaultValue = "",
  size = "sm",
  className,
  placeholder = "Buscar filamento, marca, cor…",
  autoFocus = false,
}: {
  defaultValue?: string;
  size?: "sm" | "lg";
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const term = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      if (term.length < 2) {
        setItems([]);
        setActive(-1);
        return;
      }
      fetch(`/api/busca/sugestoes?q=${encodeURIComponent(term)}`, {
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          setItems(Array.isArray(data.items) ? data.items : []);
          setActive(-1);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  function go(term: string) {
    const t = term.trim();
    if (t.length < 2) return;
    setOpen(false);
    router.push(`/busca?q=${encodeURIComponent(t)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || items.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        go(q);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = active >= 0 ? items[active] : null;
      if (sel) {
        setOpen(false);
        router.push(`/produto/${sel.slug}`);
      } else {
        go(q);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const formClass =
    size === "lg"
      ? "flex items-center gap-2 rounded-full border-[1.5px] border-input bg-card py-1.5 pl-5 pr-1.5 shadow-md transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15"
      : "flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-2 transition-colors focus-within:border-brand focus-within:bg-card";

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className={formClass}
      >
        <Search
          className={cn(
            "shrink-0 text-muted-foreground",
            size === "lg" ? "size-5" : "size-4",
          )}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Buscar no catálogo"
          autoFocus={autoFocus}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-muted-foreground",
            size === "lg" ? "text-base" : "text-sm",
          )}
        />
        {size === "lg" ? (
          <button
            type="submit"
            className="grad-brand inline-flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(14,126,123,0.5)] transition-transform hover:-translate-y-px active:translate-y-0"
          >
            Buscar
          </button>
        ) : null}
      </form>

      {open && items.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover py-1 text-left shadow-lg">
          {items.map((it, i) => (
            <li key={it.slug}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  router.push(`/produto/${it.slug}`);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                  i === active ? "bg-accent" : "hover:bg-accent",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{it.name}</span>
                  <span className="block truncate font-mono text-[11px] text-muted-foreground">
                    {it.brandName} · {kindLabel(it.kind)}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(q)}
              className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-left text-sm font-semibold text-brand transition-colors hover:bg-accent"
            >
              <Search className="size-4" />
              Ver todos os resultados para “{q.trim()}”
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
