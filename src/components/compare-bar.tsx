"use client";

import Link from "next/link";
import { ArrowRight, Scale, X } from "lucide-react";

import { clearCompare, useCompare } from "@/lib/use-compare";

const TIPO: Record<string, string> = {
  FILAMENT: "filamento",
  RESIN: "resina",
  PRINTER: "impressora",
};

export function CompareBar() {
  const { kind, slugs } = useCompare();
  if (!kind || slugs.length === 0) return null;

  const ready = slugs.length >= 2;
  const href = `/comparar?tipo=${TIPO[kind]}&p=${slugs.join(",")}`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-3 rounded-full border bg-popover/95 py-2 pl-5 pr-2 shadow-lg backdrop-blur">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Scale className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {slugs.length}{" "}
            {slugs.length === 1 ? "produto selecionado" : "produtos selecionados"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {ready
              ? "Pronto para comparar lado a lado"
              : "Selecione mais um produto para comparar"}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCompare}
          aria-label="Limpar comparação"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        {ready ? (
          <Link
            href={href}
            className="grad-brand inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white"
          >
            Comparar
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
