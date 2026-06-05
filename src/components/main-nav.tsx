import Link from "next/link";
import { Bot, ChevronDown, ScanSearch, Sparkles } from "lucide-react";

import { MAIN_NAV, isGroup } from "@/lib/nav";

const itemClass =
  "rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

const IA_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "/ferramentas/assistente": Bot,
  "/ferramentas/diagnostico": ScanSearch,
  "/ia": Sparkles,
};

export function MainNav() {
  return (
    <nav className="mr-1 hidden items-center gap-0.5 text-sm font-medium xl:flex">
      {MAIN_NAV.map((entry) => {
        // IA em destaque: pílula com gradiente + submenu das ferramentas de IA.
        if (isGroup(entry) && entry.accent) {
          return (
            <div key={entry.label} className="group relative ml-1">
              <Link
                href={entry.href}
                className="grad-brand inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 font-semibold text-white shadow-md shadow-brand/30 ring-1 ring-white/25 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand/40"
              >
                <Sparkles className="size-4" />
                {entry.label}
                <ChevronDown className="size-3.5 opacity-90 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="w-72 rounded-2xl border border-brand/25 bg-popover p-2 shadow-lg">
                  <p className="px-2 pb-1 pt-1 font-mono text-[10px] font-bold uppercase tracking-wide text-teal">
                    Ferramentas de IA
                  </p>
                  {entry.items.map((it) => {
                    const Icon = IA_ICONS[it.href] ?? Sparkles;
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className="flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-accent"
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-4">
                          <Icon />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {it.label}
                          </span>
                          {it.desc ? (
                            <span className="block text-xs text-muted-foreground">
                              {it.desc}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }
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
        return (
          <Link key={entry.href} href={entry.href} className={itemClass}>
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
