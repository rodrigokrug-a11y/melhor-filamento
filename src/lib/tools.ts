import {
  ArrowLeftRight,
  Calculator,
  ClipboardList,
  Disc3,
  FlaskConical,
  Gauge,
  GitCompare,
  Package,
  Ruler,
  Scaling,
  ShoppingCart,
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
  featured?: boolean; // card com identidade própria (destaque)
  tagline?: string; // chamada curta (cards em destaque)
  cta?: string; // texto do botão (cards em destaque)
  bgImage?: string; // imagem de fundo do card em destaque
};

export const TOOLS: Tool[] = [
  {
    slug: "gerador-de-cases",
    name: "MyMiniCase",
    description:
      "Envie seu STL e gere um case no formato exato da peça — pra transportar miniaturas de RPG, ferramentas, o que for. Faz um ou vários objetos de uma vez. Imprima em casa.",
    icon: Package,
    available: true,
    externalUrl: "https://www.myminicase.com",
    featured: true,
    tagline: "Transporte suas minis com segurança.",
    cta: "Acessar o MyMiniCase",
    bgImage: "/img/myminicase-hero.jpg",
  },
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
    slug: "calculadora-de-resina",
    name: "Calculadora de resina",
    description:
      "Custo de uma impressão em resina (SLA/LCD): volume em mL × preço por litro, com suportes e margem.",
    icon: FlaskConical,
    available: true,
  },
  {
    slug: "imprimir-ou-comprar",
    name: "Imprimir ou comprar?",
    description:
      "Compare o custo de imprimir você mesmo com o preço de comprar pronto e veja quanto economiza.",
    icon: ShoppingCart,
    available: true,
  },
  {
    slug: "orcamento-de-projeto",
    name: "Orçamento de projeto",
    description:
      "Some várias peças num cálculo só (peso e tempo de cada) e chegue ao custo total e ao preço.",
    icon: ClipboardList,
    available: true,
  },
  {
    slug: "calibracao",
    name: "Calibração (fluxo e E-steps)",
    description:
      "Ajuste a extrusão pela parede medida (flow %) e calcule os passos/mm do extrusor (E-steps).",
    icon: Gauge,
    available: true,
  },
  {
    slug: "compensacao-de-medida",
    name: "Compensação de medida",
    description:
      "Peça saiu maior ou menor? Calcule o fator de escala pra acertar a medida (encolhimento).",
    icon: Ruler,
    available: true,
  },
  {
    slug: "comparador-de-materiais",
    name: "Comparador de materiais",
    description:
      "PLA, PETG, ABS, ASA, TPU, Nylon e PC lado a lado: temperatura, resistência, dificuldade e usos.",
    icon: GitCompare,
    available: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
