"use client";

import { useState } from "react";

import {
  ToolField,
  ToolResult,
  ToolRow,
  fmt,
  parseNum,
} from "@/components/tool-ui";

export function ShrinkageCalculator() {
  const [modelo, setModelo] = useState("50");
  const [real, setReal] = useState("49,5");

  const m = parseNum(modelo);
  const r = parseNum(real);
  const encolhimento = m > 0 ? ((m - r) / m) * 100 : 0; // % (positivo = encolheu)
  const compensacao = r > 0 ? (m / r) * 100 : 0; // escala a aplicar (%)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <ToolField
          label="Medida no modelo"
          value={modelo}
          onChange={setModelo}
          suffix="mm"
          hint="O valor que você desenhou / quer obter."
        />
        <ToolField
          label="Medida impressa (real)"
          value={real}
          onChange={setReal}
          suffix="mm"
          hint="O que saiu de verdade (paquímetro)."
        />
      </div>

      <ToolResult>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Escala pra compensar
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {fmt(compensacao, 2)}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reimprima com esta escala pra acertar a medida.
          </p>
        </div>
        <div className="space-y-2 border-t pt-3">
          <ToolRow
            label={encolhimento >= 0 ? "Encolhimento" : "Expansão"}
            value={`${fmt(Math.abs(encolhimento), 2)}%`}
            strong
          />
          <ToolRow label="Diferença" value={`${fmt(m - r, 2)} mm`} />
        </div>
        <p className="text-xs text-muted-foreground">
          ABS e resina costumam encolher; às vezes a peça sai maior por
          super-extrusão. Ajuste a escala (ou o fluxo) e reimprima.
        </p>
      </ToolResult>
    </div>
  );
}
