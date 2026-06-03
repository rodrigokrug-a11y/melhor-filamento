// Navegação principal — compartilhada entre header (desktop) e menu mobile.
// `accent` destaca o item (ex.: as ferramentas de IA).
export const MAIN_NAV: { href: string; label: string; accent?: boolean }[] = [
  { href: "/filamentos", label: "Filamentos" },
  { href: "/resinas", label: "Resinas" },
  { href: "/impressoras", label: "Impressoras" },
  { href: "/comparar", label: "Comparar" },
  { href: "/perto", label: "Perto" },
  { href: "/marcas", label: "Marcas" },
  { href: "/ranking", label: "Ranking" },
  { href: "/dicas", label: "Dicas" },
  { href: "/ferramentas", label: "Ferramentas" },
  { href: "/contato", label: "Contato" },
  { href: "/ia", label: "IA", accent: true },
];
