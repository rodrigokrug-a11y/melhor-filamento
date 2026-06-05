// Navegação principal — compartilhada entre header (desktop, com dropdowns) e
// menu mobile (lista agrupada). `accent` destaca o item (ex.: IA).

export type NavLink = {
  href: string;
  label: string;
  accent?: boolean;
  desc?: string;
};
export type NavGroup = {
  label: string;
  href: string;
  accent?: boolean;
  items: NavLink[];
};
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
  {
    label: "IA",
    href: "/ia",
    accent: true,
    items: [
      {
        href: "/ferramentas/assistente",
        label: "Assistente de impressão",
        desc: "Tire dúvidas com a IA na hora",
      },
      {
        href: "/ferramentas/diagnostico",
        label: "Diagnóstico por foto",
        desc: "Mande a foto de uma peça com problema",
      },
      {
        href: "/ia",
        label: "Tudo sobre a IA",
        desc: "Conheça as ferramentas de IA",
      },
    ],
  },
];
