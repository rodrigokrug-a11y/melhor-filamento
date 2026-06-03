import { Calculator, type LucideIcon } from "lucide-react";

// Registro de mini-ferramentas. Para adicionar uma nova: crie a página em
// src/app/ferramentas/<slug>/page.tsx e registre aqui (available: true).
export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
};

export const TOOLS: Tool[] = [
  {
    slug: "calculadora-de-custo",
    name: "Calculadora de custo",
    description:
      "Calcule o custo real de uma impressão (material, energia, desgaste e falhas) e o preço de venda com a sua margem.",
    icon: Calculator,
    available: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
