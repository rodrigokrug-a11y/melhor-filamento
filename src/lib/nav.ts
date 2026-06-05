// Navegação principal — compartilhada entre header (desktop, com dropdowns) e
// menu mobile (lista agrupada). `accent` destaca o item (ex.: IA).

export type NavLink = { href: string; label: string; accent?: boolean };
export type NavGroup = { label: string; href: string; items: NavLink[] };
export type NavEntry = NavLink | NavGroup;

export function isGroup(e: NavEntry): e is NavGroup {
  return "items" in e;
}

export const MAIN_NAV: NavEntry[] = [
  {
    label: "Catálogo",
    href: "/filamentos",
    items: [
      { href: "/filamentos", label: "Filamentos" },
      { href: "/resinas", label: "Resinas" },
      { href: "/impressoras", label: "Impressoras" },
      { href: "/marcas", label: "Marcas" },
      { href: "/ofertas", label: "Ofertas do dia" },
      { href: "/perto", label: "Lojas perto de você" },
    ],
  },
  { href: "/comparar", label: "Comparar" },
  {
    label: "Ferramentas",
    href: "/ferramentas",
    items: [
      { href: "/ferramentas", label: "Todas as ferramentas" },
      { href: "/ranking", label: "Ranking" },
      { href: "/receitas", label: "Receitas" },
    ],
  },
  { href: "/dicas", label: "Dicas" },
  { href: "/ia", label: "IA", accent: true },
];
