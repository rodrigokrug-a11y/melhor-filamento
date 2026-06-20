import Link from "next/link";
import {
  Disc3,
  FlaskConical,
  LayoutGrid,
  Printer,
  Tag,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS: { label: string; href: string; key: string; icon: LucideIcon }[] = [
  { label: "Tudo", href: "/filamentos", key: "tudo", icon: LayoutGrid },
  { label: "PLA", href: "/filamentos?material=PLA", key: "PLA", icon: Disc3 },
  { label: "PETG", href: "/filamentos?material=PETG", key: "PETG", icon: Disc3 },
  { label: "ABS", href: "/filamentos?material=ABS", key: "ABS", icon: Disc3 },
  { label: "TPU", href: "/filamentos?material=TPU", key: "TPU", icon: Disc3 },
  { label: "ASA", href: "/filamentos?material=ASA", key: "ASA", icon: Disc3 },
  { label: "Resinas", href: "/resinas", key: "resinas", icon: FlaskConical },
  { label: "Impressoras", href: "/impressoras", key: "impressoras", icon: Printer },
  { label: "Ofertas", href: "/ofertas", key: "ofertas", icon: Tag },
];

export function CatStrip({ active }: { active?: string }) {
  return (
    <div className="border-b bg-background/70">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((it) => {
          const on = active === it.key;
          const Icon = it.icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                on
                  ? "bg-brand-soft text-brand"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {it.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
