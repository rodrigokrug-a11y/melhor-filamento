import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";

import { MAIN_NAV, isGroup } from "@/lib/nav";

const itemClass =
  "rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

export function MainNav() {
  return (
    <nav className="mr-1 hidden items-center gap-0.5 text-sm font-medium xl:flex">
      {MAIN_NAV.map((entry) => {
        if (isGroup(entry)) {
          return (
            <div key={entry.label} className="group relative">
              <Link
                href={entry.href}
                className={`inline-flex items-center gap-1 ${itemClass}`}
              >
                {entry.label}
                <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
              </Link>
              {/* Painel: pt-2 cria uma "ponte" pro hover não quebrar no gap. */}
              <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="min-w-52 rounded-xl border bg-popover p-1.5 shadow-lg">
                  {entry.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        if (entry.accent) {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className="grad-brand ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-3.5" />
              {entry.label}
            </Link>
          );
        }
        return (
          <Link key={entry.href} href={entry.href} className={itemClass}>
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
