"use client";

import { useMemo, useState } from "react";

import { cn, formatBRL } from "@/lib/utils";

type Point = { date: string; price: number };

const PERIODS = [30, 90, 180];

/** Passo "redondo" (1, 2, 2.5, 5, 10…) para a escala do eixo. */
function niceStep(range: number, target = 4): number {
  const raw = range / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return step * mag;
}

function ddmm(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

function axisLabel(v: number): string {
  return `R$ ${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}`;
}

export function PriceHistoryChart({ points }: { points: Point[] }) {
  const [period, setPeriod] = useState(30);
  const [hover, setHover] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (points.length === 0) return points;
    const last = new Date(`${points[points.length - 1].date}T00:00:00Z`);
    const cutoff = new Date(last.getTime() - period * 86400000)
      .toISOString()
      .slice(0, 10);
    return points.filter((p) => p.date >= cutoff);
  }, [points, period]);

  const periodButtons = (
    <div className="flex gap-1">
      {PERIODS.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => {
            setPeriod(d);
            setHover(null);
          }}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            period === d
              ? "bg-brand text-brand-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {d} dias
        </button>
      ))}
    </div>
  );

  if (filtered.length < 2) {
    return (
      <div>
        <div className="flex justify-end">{periodButtons}</div>
        <p className="mt-3 text-sm text-muted-foreground">
          Sem histórico suficiente neste período.
        </p>
      </div>
    );
  }

  const W = 600;
  const H = 210;
  const ML = 50;
  const MR = 14;
  const MT = 12;
  const MB = 30;
  const plotW = W - ML - MR;
  const plotH = H - MT - MB;

  const prices = filtered.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const step = niceStep((max - min) || max * 0.1 || 1);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const domain = niceMax - niceMin || 1;

  const yTicks: number[] = [];
  for (let t = niceMin; t <= niceMax + 1e-9; t += step)
    yTicks.push(Number(t.toFixed(4)));

  const xTickCount = Math.min(5, filtered.length);
  const xTicks = Array.from({ length: xTickCount }, (_, k) =>
    Math.round((k / (xTickCount - 1)) * (filtered.length - 1)),
  );

  const current = filtered[filtered.length - 1].price;
  const lowIdx = prices.indexOf(min);

  const x = (i: number) => ML + (i / (filtered.length - 1)) * plotW;
  const y = (p: number) => MT + (1 - (p - niceMin) / domain) * plotH;

  const line = filtered
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`)
    .join(" ");
  const baseY = MT + plotH;
  const area = `${line} L${x(filtered.length - 1).toFixed(1)},${baseY} L${x(0).toFixed(1)},${baseY} Z`;

  const active = Math.min(hover ?? filtered.length - 1, filtered.length - 1);
  const ap = filtered[active];

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((rx - ML) / plotW) * (filtered.length - 1));
    setHover(Math.max(0, Math.min(filtered.length - 1, i)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
          <span>
            Atual{" "}
            <span className="font-display font-bold tnum">
              {formatBRL(current)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Menor{" "}
            <span className="font-semibold text-offer tnum">
              {formatBRL(min)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Maior <span className="font-medium tnum">{formatBRL(max)}</span>
          </span>
        </div>
        {periodButtons}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Gráfico do histórico de preço"
      >
        <defs>
          <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--brand)", stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: "var(--brand)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Eixo Y: grade + rótulos de preço */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={ML}
              y1={y(t)}
              x2={W - MR}
              y2={y(t)}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={ML - 8}
              y={y(t) + 3.5}
              textAnchor="end"
              fontSize="11"
              className="fill-muted-foreground"
            >
              {axisLabel(t)}
            </text>
          </g>
        ))}

        {/* Área + linha */}
        <path d={area} fill="url(#ph-fill)" />
        <path
          d={line}
          fill="none"
          className="stroke-brand"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Linha de referência: menor preço do período */}
        <line
          x1={ML}
          y1={y(min)}
          x2={W - MR}
          y2={y(min)}
          className="stroke-offer"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx={x(lowIdx)} cy={y(min)} r="3.5" className="fill-offer" />

        {/* Crosshair + ponto ativo (hover) */}
        <line
          x1={x(active)}
          y1={MT}
          x2={x(active)}
          y2={baseY}
          className="stroke-brand/40"
          strokeWidth="1"
        />
        <circle
          cx={x(active)}
          cy={y(ap.price)}
          r="4"
          className="fill-brand stroke-background"
          strokeWidth="2"
        />

        {/* Eixo X: datas */}
        {xTicks.map((i, k) => (
          <text
            key={i}
            x={x(i)}
            y={H - 9}
            textAnchor={k === 0 ? "start" : k === xTicks.length - 1 ? "end" : "middle"}
            fontSize="11"
            className="fill-muted-foreground"
          >
            {ddmm(filtered[i].date)}
          </text>
        ))}
      </svg>

      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(ap.date).toLocaleDateString("pt-BR")}:{" "}
        <span className="font-medium text-foreground tnum">
          {formatBRL(ap.price)}
        </span>
        {active === lowIdx ? (
          <span className="ml-1 text-offer">· menor preço do período</span>
        ) : null}
      </p>
    </div>
  );
}
