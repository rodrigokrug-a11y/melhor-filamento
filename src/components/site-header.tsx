import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { AuthNav } from "@/components/auth-nav";
import { CepSelector } from "@/components/cep-selector";
import { CEP_ENABLED } from "@/lib/region";
import { FavoritesNavLink } from "@/components/favorites-nav-link";
import { Logo } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div aria-hidden className="grad-brand h-[3px] w-full" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
        >
          <Logo className="size-8 shrink-0" />
          <span className="hidden whitespace-nowrap font-display text-lg font-bold tracking-tight sm:inline-block">
            Melhor<span className="text-brand">Filamento</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <MainNav />
          <Link
            href="/cadastrar-oferta"
            className="mr-1 hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-input px-4 text-sm font-semibold text-teal transition-colors hover:border-brand hover:bg-brand-soft hover:text-teal xl:inline-flex"
          >
            <Plus className="size-4" />
            Cadastrar oferta
          </Link>
          <Link
            href="/busca"
            aria-label="Buscar"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="size-5" />
          </Link>
          <FavoritesNavLink />
          {CEP_ENABLED ? <CepSelector /> : null}
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
