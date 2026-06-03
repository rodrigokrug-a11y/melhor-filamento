import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { AuthNav } from "@/components/auth-nav";
import { CepSelector } from "@/components/cep-selector";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { MAIN_NAV } from "@/lib/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div aria-hidden className="grad-brand h-[3px] w-full" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <Logo className="size-8" />
          <span className="font-display text-lg font-bold tracking-tight">
            Melhor<span className="text-brand">Filamento</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <nav className="mr-1 hidden items-center gap-0.5 text-sm font-medium xl:flex">
            {MAIN_NAV.map((item) =>
              item.accent ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="grad-brand ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Sparkles className="size-3.5" />
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <Link
            href="/cadastrar-oferta"
            className="mr-1 hidden items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/15 xl:inline-flex"
          >
            <Plus className="size-4" />
            Cadastrar oferta
          </Link>
          <CepSelector />
          <ThemeToggle />
          <div className="hidden sm:block">
            <AuthNav />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
