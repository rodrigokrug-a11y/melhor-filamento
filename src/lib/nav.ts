import {
  Bot,
  Boxes,
  Flame,
  FlaskConical,
  Lightbulb,
  type LucideIcon,
  MapPin,
  Printer,
  ScanSearch,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trophy,
} from "lucide-react";

import { getTool } from "@/lib/tools";

// Navegação principal — header (desktop, com dropdowns/mega-menu) e menu mobile.

export type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
  desc?: string;
  accent?: boolean;
};
export type NavSection = { label: string; items: NavLink[] };
export type NavGroup = {
  label: string;
  href: string;
  accent?: boolean;
  items?: NavLink[]; // dropdown simples
  sections?: NavSection[]; // mega-menu (categorias)
};
export type NavEntry = NavLink | NavGroup;

export function isGroup(e: NavEntry): e is NavGroup {
  return "items" in e || "sections" in e;
}

// Link de ferramenta a partir do registro (nome + ícone vêm de tools.ts).
function tool(slug: string): NavLink | null {
  const t = getTool(slug);
  return t ? { href: `/ferramentas/${slug}`, label: t.name, icon: t.icon } : null;
}
function tools(...slugs: string[]): NavLink[] {
  return slugs.map(tool).filter((x): x is NavLink => x !== null);
}

export const MAIN_NAV: NavEntry[] = [
  {
    label: "Catálogo",
    href: "/filamentos",
    items: [
      { href: "/filamentos", label: "Filamentos", icon: Boxes },
      { href: "/resinas", label: "Resinas", icon: FlaskConical },
      { href: "/impressoras", label: "Impressoras", icon: Printer },
      { href: "/marcas", label: "Marcas", icon: Store },
      { href: "/ofertas", label: "Ofertas do dia", icon: Flame },
      { href: "/perto", label: "Lojas perto de você", icon: MapPin },
    ],
  },
  { href: "/comparar", label: "Comparar" },
  {
    label: "Ferramentas",
    href: "/ferramentas",
    sections: [
      {
        label: "Calculadoras de custo",
        items: tools(
          "calculadora-de-custo",
          "custo-por-gcode",
          "custo-de-energia",
          "calculadora-de-resina",
          "orcamento-de-projeto",
        ),
      },
      {
        label: "Filamento & material",
        items: tools(
          "calculadora-de-filamento",
          "comparador-de-materiais",
          "quiz-filamento",
          "ranking-de-custo",
        ),
      },
      {
        label: "Ajuste & calibração",
        items: tools(
          "calculadora-de-escala",
          "compensacao-de-medida",
          "calibracao",
          "conversor",
        ),
      },
      {
        label: "Economia & compras",
        items: tools("imprimir-ou-comprar", "otimizador-de-cesta"),
      },
    ],
  },
  {
    label: "Comunidade",
    href: "/dicas",
    items: [
      { href: "/dicas", label: "Dicas e tutoriais", icon: Lightbulb },
      {
        href: "/receitas",
        label: "Configurações de impressão",
        icon: SlidersHorizontal,
      },
      { href: "/ranking", label: "Ranking", icon: Trophy },
    ],
  },
  {
    label: "IA",
    href: "/ia",
    accent: true,
    items: [
      {
        href: "/ferramentas/assistente",
        label: "Assistente de impressão",
        desc: "Tire dúvidas com a IA na hora",
        icon: Bot,
      },
      {
        href: "/ferramentas/diagnostico",
        label: "Diagnóstico por foto",
        desc: "Mande a foto de uma peça com problema",
        icon: ScanSearch,
      },
      {
        href: "/ia",
        label: "Tudo sobre a IA",
        desc: "Conheça as ferramentas de IA",
        icon: Sparkles,
      },
    ],
  },
];
