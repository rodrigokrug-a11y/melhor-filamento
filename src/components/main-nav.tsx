import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

import { MAIN_NAV, type NavLink as NavLinkT, isGroup } from "@/lib/nav";

const triggerClass =
  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

const panelWrap =
  "invisible absolute top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100";

function DropdownItem({ it }: { it: NavLinkT }) {
  const Icon = it.icon;
  return (
    <Link
      href={it.href}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {Icon ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-4">
          <Icon />
        </span>
      ) : null}
      <span>{it.label}</span>
    </Link>
  );
}

export function MainNav() {
  return (
    <nav className="mr-1 hidden items-center gap-0.5 text-sm font-medium xl:flex">
      {MAIN_NAV.map((entry) => {
        // IA em destaque
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
              <div className={`${panelWrap} right-0`}>
                <div className="w-72 rounded-2xl border border-brand/25 bg-popover p-2 shadow-lg">
                  <p className="px-2 pb-1 pt-1 font-mono text-[10px] font-bold uppercase tracking-wide text-teal">
                    Ferramentas de IA
                  </p>
                  {(entry.items ?? []).map((it) => {
                    const Icon = it.icon;
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className="flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-accent"
                      >
                        {Icon ? (
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-4">
                            <Icon />
                          </span>
                        ) : null}
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

        // Mega-menu (categorias)
        if (isGroup(entry) && entry.sections) {
          return (
            <div key={entry.label} className="group relative">
              <Link href={entry.href} className={triggerClass}>
                {entry.label}
                <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
              </Link>
              <div className={`${panelWrap} left-1/2 -translate-x-1/2`}>
                <div className="w-[560px] rounded-2xl border bg-popover p-3 shadow-lg">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    {entry.sections.map((sec) => (
                      <div key={sec.label}>
                        <p className="px-2.5 pb-1 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {sec.label}
                        </p>
                        {sec.items.map((it) => (
                          <DropdownItem key={it.href} it={it} />
                        ))}
                      </div>
                    ))}
                  </div>
                  <Link
                    href={entry.href}
                    className="mt-2 flex items-center gap-1.5 border-t px-2.5 pt-2.5 text-sm font-semibold text-brand transition-colors hover:underline"
                  >
                    Ver todas as ferramentas
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        // Dropdown simples (com ícones)
        if (isGroup(entry)) {
          return (
            <div key={entry.label} className="group relative">
              <Link href={entry.href} className={triggerClass}>
                {entry.label}
                <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
              </Link>
              <div className={`${panelWrap} left-0`}>
                <div className="w-60 rounded-xl border bg-popover p-1.5 shadow-lg">
                  {(entry.items ?? []).map((it) => (
                    <DropdownItem key={it.href} it={it} />
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={entry.href}
            href={entry.href}
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
