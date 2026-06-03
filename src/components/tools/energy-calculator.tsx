"use client";

import { useState } from "react";

import { ToolField, ToolResult, ToolRow, fmt, parseNum } from "@/components/tool-ui";
import { formatBRL } from "@/lib/utils";

export function EnergyCalculator() {
  const [potencia, setPotencia] = useState("150");
  const [tempo, setTempo] = useState("4");
  const [precoKwh, setPrecoKwh] = useState("0,95");
  const [vezesMes, setVezesMes] = useState("20");

  const kwh = (parseNum(potencia) / 1000) * parseNum(tempo);
  const custoUso = kwh * parseNum(precoKwh);
  const vezes = parseNum(vezesMes);
  const custoMes = custoUso * vezes;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <ToolField
          label="Potência da impressora"
          value={potencia}
          onChange={setPotencia}
          suffix="W"
          hint="FDM ~100–250 W; resina ~50–100 W."
        />
        <ToolField
          label="Tempo de uso"
          value={tempo}
          onChange={setTempo}
          suffix="h"
          hint="Duração da impressão (ou por dia)."
        />
        <ToolField
          label="Preço da energia"
          value={precoKwh}
          onChange={setPrecoKwh}
          suffix="R$/kWh"
          hint="Está na sua conta de luz."
        />
        <ToolField
          label="Vezes por mês"
          value={vezesMes}
          onChange={setVezesMes}
          suffix="×"
          hint="Quantas impressões assim no mês."
        />
      </div>

      <ToolResult>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Custo por impressão
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {formatBRL(custoUso)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmt(kwh, 3)} kWh consumidos.
          </p>
        </div>
        <div className="space-y-2 border-t pt-3">
          <ToolRow label="Consumo" value={`${fmt(kwh, 3)} kWh`} />
          <ToolRow
            label={`No mês (${fmt(vezes, 0)}×)`}
            value={formatBRL(custoMes)}
            strong
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Só a energia. Para o custo completo (com material e desgaste), use a{" "}
          calculadora de custo.
        </p>
      </ToolResult>
    </div>
  );
}
