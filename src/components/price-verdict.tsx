import { Flame, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { formatBRL } from "@/lib/utils";

function median(sorted: number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

type Tone = "best" | "good" | "avg" | "high";

const TONES: Record<
  Tone,
  { Icon: typeof Flame; label: string; note: string; color: string }
> = {
  best: {
    Icon: Flame,
    label: "Melhor preço",
    note: "boa hora de comprar",
    color: "text-[var(--accent-text)]",
  },
  good: {
    Icon: TrendingDown,
    label: "Bom preço",
    note: "abaixo do preço típico",
    color: "text-teal",
  },
  avg: {
    Icon: Minus,
    label: "Preço na média",
    note: "no preço típico do período",
    color: "text-muted-foreground",
  },
  high: {
    Icon: TrendingUp,
    label: "Acima do típico",
    note: "pode valer esperar uma queda",
    color: "text-[var(--gold)]",
  },
};

/**
 * Termômetro de preço ("comprar agora ou esperar"): compara o melhor preço
 * atual com a faixa histórica (mínima por dia) — mínima, preço típico (mediana)
 * e máxima — e mostra um veredito + a posição do preço atual na faixa.
 * Não renderiza nada se não houver histórico suficiente.
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
  const prices = history.map((h) => h.price).filter(Number.isFinite);
  if (prices.length < 3) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (!(max > min)) return null;

  const sorted = [...prices].sort((a, b) => a - b);
  const typical = median(sorted);

  // posição (0 = mínima histórica, 1 = máxima) do preço atual e do típico
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const pos = clamp((bestPrice - min) / (max - min));
  const typPos = clamp((typical - min) / (max - min));

  let tone: Tone;
  if (bestPrice <= min * 1.03) tone = "best";
  else if (bestPrice < typical * 0.98) tone = "good";
  else if (bestPrice <= typical * 1.05) tone = "avg";
  else tone = "high";

  const { Icon, label, note, color } = TONES[tone];

  return (
    <div className="mt-3">
      <div className={`flex items-center gap-1.5 text-sm font-semibold ${color}`}>
        <Icon className="size-4 shrink-0" />
        <span>{label}</span>
        <span className="font-normal text-muted-foreground">— {note}</span>
      </div>

      {/* termômetro: posição do preço atual na faixa histórica */}
      <div
        className="relative mt-2.5 h-2 rounded-full"
        style={{
          background:
            "linear-gradient(90deg,#54B62E 0%,#E0A92E 62%,#D97706 100%)",
        }}
        role="img"
        aria-label={`Preço atual ${formatBRL(bestPrice)}, entre a mínima ${formatBRL(min)} e a máxima ${formatBRL(max)} do período`}
      >
        {/* marca do preço típico (mediana) */}
        <span
          aria-hidden
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-white/70"
          style={{ left: `${typPos * 100}%` }}
        />
        {/* marcador do preço atual */}
        <span
          aria-hidden
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--color-navy)] shadow"
          style={{ left: `${pos * 100}%` }}
        />
      </div>

      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground tnum">
        <span>menor {formatBRL(min)}</span>
        <span>típico {formatBRL(typical)}</span>
        <span>maior {formatBRL(max)}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        com base no histórico dos últimos {months} meses
      </p>
    </div>
  );
}
