import Link from "next/link";

import { Logo } from "@/components/logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Catálogo",
    links: [
      { href: "/ofertas", label: "Ofertas do dia" },
      { href: "/filamentos", label: "Filamentos" },
      { href: "/resinas", label: "Resinas" },
      { href: "/impressoras", label: "Impressoras" },
      { href: "/comparar", label: "Comparar" },
      { href: "/marcas", label: "Marcas" },
    ],
  },
  {
    title: "Ferramentas",
    links: [
      { href: "/ferramentas", label: "Ferramentas" },
      { href: "/ia", label: "Assistente IA" },
      { href: "/ranking", label: "Ranking" },
      { href: "/receitas", label: "Configurações de impressão" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: "/entrar", label: "Entrar" },
      { href: "/cadastrar-oferta", label: "Anunciar oferta" },
      { href: "/contato", label: "Contato" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 bg-navy text-[#9fc0bc]">
      <div aria-hidden className="grad-brand h-[3px] w-full" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="size-8" />
              <span className="font-display text-base font-bold tracking-tight text-white">
                Melhor
                <span className="text-[var(--teal-300)]">Filamento</span>
              </span>
            </Link>
            <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#7fa9a4]">
              Compare. Descubra.{" "}
              <span className="text-[var(--green-400)]">Compre melhor.</span>
            </p>
            <p className="mt-4 text-sm text-[#9fc0bc]">
              O melhor custo em filamentos, resinas e impressoras 3D no Brasil —
              com frete estimado para o seu CEP.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#6f8b88]">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[#bcd3d0] transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#7fa9a4] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Melhor Filamento. Comparador de preços para impressão 3D.
          </p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacidade"
              className="transition-colors hover:text-white"
            >
              Privacidade
            </Link>
            <Link href="/termos" className="transition-colors hover:text-white">
              Termos
            </Link>
            <span className="text-[#5f7b78]">
              Feito para a comunidade maker 🇧🇷
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
