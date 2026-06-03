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

export function ResinCalculator() {
  const [volume, setVolume] = useState("10");
  const [suportesPct, setSuportesPct] = useState("20");
  const [precoL, setPrecoL] = useState("250");
  const [extras, setExtras] = useState("0");
  const [falhaPct, setFalhaPct] = useState("5");
  const [margemPct, setMargemPct] = useState("0");

  const vPeca = parseNum(volume);
  const vSup = vPeca * (parseNum(suportesPct) / 100);
  const vTotal = vPeca + vSup;
  const custoResina = (vTotal / 1000) * parseNum(precoL);
  const subtotal = custoResina + parseNum(extras);
  const custoTotal = subtotal * (1 + parseNum(falhaPct) / 100);
  const precoSugerido = custoTotal * (1 + parseNum(margemPct) / 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <ToolField
          label="Volume da peça"
          value={volume}
          onChange={setVolume}
          suffix="mL"
          hint="O fatiador (Lychee, Chitubox) mostra."
        />
        <ToolField
          label="Suportes"
          value={suportesPct}
          onChange={setSuportesPct}
          suffix="%"
          hint="Resina extra dos suportes (~15–30%)."
        />
        <ToolField
          label="Preço da resina"
          value={precoL}
          onChange={setPrecoL}
          suffix="R$/L"
          hint="1 L = 1000 mL."
        />
        <ToolField
          label="Extras (álcool, cura)"
          value={extras}
          onChange={setExtras}
          suffix="R$"
          hint="Custo fixo por peça (opcional)."
        />
        <ToolField
          label="Taxa de falha"
          value={falhaPct}
          onChange={setFalhaPct}
          suffix="%"
        />
        <ToolField
          label="Margem de lucro"
          value={margemPct}
          onChange={setMargemPct}
          suffix="%"
        />
      </div>

      <ToolResult>
        <ToolRow label="Resina (com suportes)" value={`${fmt(vTotal)} mL`} />
        <ToolRow label="Custo da resina" value={formatBRL(custoResina)} />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="font-medium">Custo total</span>
          <span className="font-display text-xl font-bold tabular-nums">
            {formatBRL(custoTotal)}
          </span>
        </div>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Preço de venda sugerido
            {parseNum(margemPct) > 0 ? ` (margem ${fmt(parseNum(margemPct))}%)` : ""}
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {formatBRL(precoSugerido)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Estimativa pra impressão SLA/LCD. O cálculo é todo no seu navegador.
        </p>
      </ToolResult>
    </div>
  );
}
