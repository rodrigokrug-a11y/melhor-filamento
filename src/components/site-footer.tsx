import Link from "next/link";

import { Logo } from "@/components/logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Catálogo",
    links: [
      { href: "/filamentos", label: "Filamentos" },
      { href: "/resinas", label: "Resinas" },
      { href: "/comparar", label: "Comparar" },
      { href: "/perto", label: "Lojas perto de você" },
      { href: "/marcas", label: "Marcas" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { href: "/ranking", label: "Ranking" },
      { href: "/dicas", label: "Dicas e tutoriais" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: "/entrar", label: "Entrar" },
      { href: "/cadastrar-oferta", label: "Anunciar oferta" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="size-7" />
              <span className="font-display text-base font-bold tracking-tight">
                Melhor<span className="text-brand">Filamento</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              O melhor custo em filamentos e resinas para impressão 3D no Brasil
              — com frete estimado para o seu CEP.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Melhor Filamento. Comparador de preços para impressão 3D.</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacidade"
              className="transition-colors hover:text-foreground"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="transition-colors hover:text-foreground"
            >
              Termos
            </Link>
            <span className="text-muted-foreground/70">
              Feito para a comunidade maker 🇧🇷
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
