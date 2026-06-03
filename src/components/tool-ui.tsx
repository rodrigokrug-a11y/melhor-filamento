"use client";

import type { ReactNode } from "react";

export const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Texto → número >= 0, aceitando vírgula OU ponto decimal (formato BR).
 *  Com vírgula: ponto vira milhar ("1.234,5"). Sem vírgula: ponto é decimal. */
export function parseNum(v: string): number {
  const s = v.trim();
  const cleaned = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const f = parseFloat(cleaned);
  return Number.isFinite(f) && f >= 0 ? f : 0;
}

/** Formata número com até `dec` casas, em pt-BR. */
export function fmt(value: number, dec = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec,
  });
}

export function ToolField({
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {suffix ? (
          <span className="shrink-0 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function ToolRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={`tabular-nums ${strong ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/** Cartão de resultado padronizado (lateral, sticky no desktop). */
export function ToolResult({ children }: { children: ReactNode }) {
  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        {children}
      </div>
    </div>
  );
}
