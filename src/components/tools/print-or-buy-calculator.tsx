"use client";

import { useState } from "react";

import {
  ToolField,
  ToolResult,
  ToolRow,
  fmt,
  parseNum,
} from "@/components/tool-ui";
import { formatBRL } from "@/lib/utils";

export function PrintOrBuyCalculator() {
  const [peso, setPeso] = useState("50");
  const [precoKg, setPrecoKg] = useState("120");
  const [tempo, setTempo] = useState("3");
  const [potencia, setPotencia] = useState("150");
  const [precoKwh, setPrecoKwh] = useState("0,95");
  const [precoComprar, setPrecoComprar] = useState("45");
  const [qtd, setQtd] = useState("1");

  const material = (parseNum(peso) / 1000) * parseNum(precoKg);
  const energia = (parseNum(potencia) / 1000) * parseNum(tempo) * parseNum(precoKwh);
  const custoImprimir = material + energia;
  const custoComprar = parseNum(precoComprar);
  const n = Math.max(1, parseNum(qtd));

  const difUnit = custoComprar - custoImprimir; // >0: imprimir economiza
  const difTotal = difUnit * n;
  const imprimirCompensa = difUnit > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Imprimir você mesmo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToolField label="Peso da peça" value={peso} onChange={setPeso} suffix="g" />
            <ToolField
              label="Preço do filamento"
              value={precoKg}
              onChange={setPrecoKg}
              suffix="R$/kg"
            />
            <ToolField label="Tempo" value={tempo} onChange={setTempo} suffix="h" />
            <ToolField
              label="Potência"
              value={potencia}
              onChange={setPotencia}
              suffix="W"
            />
            <ToolField
              label="Energia"
              value={precoKwh}
              onChange={setPrecoKwh}
              suffix="R$/kWh"
            />
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Comprar pronto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToolField
              label="Preço por unidade"
              value={precoComprar}
              onChange={setPrecoComprar}
              suffix="R$"
            />
            <ToolField label="Quantidade" value={qtd} onChange={setQtd} suffix="un" />
          </div>
        </section>
      </div>

      <ToolResult>
        <ToolRow label="Imprimir (por un.)" value={formatBRL(custoImprimir)} />
        <ToolRow label="Comprar (por un.)" value={formatBRL(custoComprar)} />
        <div
          className={`rounded-xl p-4 ${
            imprimirCompensa ? "bg-emerald-500/10" : "bg-amber-500/10"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {imprimirCompensa ? "Vale a pena imprimir 🖨️" : "Comprar sai melhor 🛒"}
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {formatBRL(Math.abs(difTotal))}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {imprimirCompensa ? "de economia" : "a mais se imprimir"} em {fmt(n, 0)}{" "}
            {n === 1 ? "unidade" : "unidades"}.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Considera material + energia (não inclui o seu tempo nem o desgaste).
        </p>
      </ToolResult>
    </div>
  );
}
