import { Flame, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

/**
 * Selo "tá caro ou tá barato?": compara o melhor preço atual com o histórico
 * (menor preço por dia). Mostra nada se não há histórico suficiente.
 */
export function PriceVerdict({
  bestPrice,
  history,
  months = 6,
}: {
  bestPrice: number | null;
  history: { date: string; price: number }[];
  months?: number;
}) {
  if (bestPrice == null || history.length < 3) return null;
  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (!Number.isFinite(min) || max <= min) return null;

  // Dentro de 2% da mínima do período = "no menor preço".
  const atMin = bestPrice <= min * 1.02;
  const pct = Math.round(((bestPrice - min) / min) * 100);

  return atMin ? (
    <Badge variant="success" className="mt-3 gap-1.5 px-3 py-1.5 text-sm">
      <Flame className="size-4" />
      No menor preço dos últimos {months} meses!
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="mt-3 gap-1.5 px-3 py-1.5 text-sm font-normal text-muted-foreground"
    >
      <TrendingDown className="size-4" />
      {pct > 0 ? `${pct}% acima` : "perto"} da mínima de {months} meses (menor:{" "}
      {formatBRL(min)})
    </Badge>
  );
}
