import {
  ArrowLeftRight,
  Calculator,
  Disc3,
  Package,
  Scaling,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Registro de mini-ferramentas. Para adicionar uma nova: crie a página em
// src/app/ferramentas/<slug>/page.tsx e registre aqui (available: true).
export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  externalUrl?: string; // se preenchido, o card abre este link (outro projeto)
};

export const TOOLS: Tool[] = [
  {
    slug: "calculadora-de-custo",
    name: "Calculadora de custo",
    description:
      "Custo real de uma impressão (material, energia, desgaste e falhas) e o preço de venda com a sua margem.",
    icon: Calculator,
    available: true,
  },
  {
    slug: "calculadora-de-filamento",
    name: "Calculadora de filamento",
    description:
      "Converta peso ↔ comprimento por material e diâmetro, veja o custo e quanto sobra no rolo.",
    icon: Disc3,
    available: true,
  },
  {
    slug: "custo-de-energia",
    name: "Custo de energia",
    description:
      "Quanto a sua impressora gasta de luz: consumo em kWh e custo por impressão e por mês.",
    icon: Zap,
    available: true,
  },
  {
    slug: "calculadora-de-escala",
    name: "Calculadora de escala",
    description:
      "Redimensione por % ou medida alvo e veja o impacto no material, peso e custo da peça.",
    icon: Scaling,
    available: true,
  },
  {
    slug: "conversor",
    name: "Conversor",
    description:
      "Temperatura (°C ↔ °F) e medidas (mm, cm, polegadas) — pra seguir perfis e guias em inglês.",
    icon: ArrowLeftRight,
    available: true,
  },
  {
    slug: "gerador-de-cases",
    name: "Gerador de cases",
    description:
      "Crie cases e estojos sob medida no nosso projeto parceiro, o MyMiniCase.",
    icon: Package,
    available: true,
    externalUrl: "https://www.myminicase.com",
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
