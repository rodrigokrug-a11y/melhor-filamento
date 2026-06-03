"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, Plus, Sparkles, X } from "lucide-react";

import { Logo } from "@/components/logo";
import { MAIN_NAV } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={open}
        className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Menu className="size-5" />
      </button>

      {/* Renderizado em portal no body: escapa do containing block do header
          (que tem backdrop-blur), garantindo que `fixed` seja relativo à viewport. */}
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[60]"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              />
              <div className="absolute right-0 top-0 flex h-full w-72 max-w-[82%] flex-col overflow-y-auto border-l bg-background p-4 shadow-2xl duration-200 animate-in slide-in-from-right">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Logo className="size-7" />
                    <span className="font-display text-base font-bold tracking-tight">
                      Melhor<span className="text-brand">Filamento</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fechar"
                    className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-0.5">
                  {MAIN_NAV.map((item) =>
                    item.accent ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="grad-brand mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white"
                      >
                        <Sparkles className="size-4" />
                        {item.label} — ferramentas de IA
                      </Link>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </nav>

                <Link
                  href="/cadastrar-oferta"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2.5 text-sm font-medium text-brand-foreground"
                >
                  <Plus className="size-4" />
                  Cadastrar oferta
                </Link>
                <Link
                  href="/entrar"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
                >
                  Entrar
                </Link>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
