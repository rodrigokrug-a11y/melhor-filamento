import Link from "next/link";

import { cn } from "@/lib/utils";

const ITEMS: { label: string; href: string; key: string }[] = [
  { label: "Tudo", href: "/filamentos", key: "tudo" },
  { label: "PLA", href: "/filamentos?material=PLA", key: "PLA" },
  { label: "PETG", href: "/filamentos?material=PETG", key: "PETG" },
  { label: "ABS", href: "/filamentos?material=ABS", key: "ABS" },
  { label: "TPU", href: "/filamentos?material=TPU", key: "TPU" },
  { label: "ASA", href: "/filamentos?material=ASA", key: "ASA" },
  { label: "Resinas", href: "/resinas", key: "resinas" },
  { label: "Impressoras", href: "/impressoras", key: "impressoras" },
  { label: "Ofertas", href: "/ofertas", key: "ofertas" },
];

export function CatStrip({ active }: { active?: string }) {
  return (
    <div className="border-b bg-background/70">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((it) => {
          const on = active === it.key;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                on
                  ? "bg-brand-soft text-brand"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
