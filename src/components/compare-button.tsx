"use client";

import { Check, Scale } from "lucide-react";

import {
  COMPARE_MAX,
  type CompareKind,
  toggleCompare,
  useCompare,
} from "@/lib/use-compare";
import { cn } from "@/lib/utils";

export function CompareButton({
  slug,
  kind,
  className,
}: {
  slug: string;
  kind: CompareKind;
  className?: string;
}) {
  const { kind: curKind, slugs } = useCompare();
  const active = curKind === kind && slugs.includes(slug);
  const full = curKind === kind && slugs.length >= COMPARE_MAX && !active;

  return (
    <button
      type="button"
      aria-label={active ? "Remover da comparação" : "Comparar"}
      aria-pressed={active}
      disabled={full}
      title={full ? `Máximo de ${COMPARE_MAX} produtos` : "Comparar"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(slug, kind);
      }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors disabled:opacity-40",
        active ? "bg-brand text-white" : "text-muted-foreground hover:text-brand",
        className,
      )}
    >
      {active ? <Check className="size-4" /> : <Scale className="size-4" />}
    </button>
  );
}
