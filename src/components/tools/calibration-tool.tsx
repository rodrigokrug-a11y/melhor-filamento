"use client";

import { useState } from "react";

import { ToolField, ToolRow, fmt, parseNum } from "@/components/tool-ui";

export function CalibrationTool() {
  // Fluxo (extrusion multiplier)
  const [flowAtual, setFlowAtual] = useState("100");
  const [espEsperada, setEspEsperada] = useState("0,4");
  const [espMedida, setEspMedida] = useState("0,42");
  const med = parseNum(espMedida);
  const novoFlow = med > 0 ? (parseNum(flowAtual) * parseNum(espEsperada)) / med : 0;

  // E-steps
  const [passosAtuais, setPassosAtuais] = useState("93");
  const [pedido, setPedido] = useState("100");
  const [real, setReal] = useState("95");
  const r = parseNum(real);
  const novosPassos = r > 0 ? (parseNum(passosAtuais) * parseNum(pedido)) / r : 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <h2 className="font-semibold">Fluxo / extrusão</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Imprima um cubo de parede única, meça a espessura e ajuste o fluxo.
          </p>
        </div>
        <ToolField
          label="Fluxo atual"
          value={flowAtual}
          onChange={setFlowAtual}
          suffix="%"
        />
        <ToolField
          label="Espessura esperada"
          value={espEsperada}
          onChange={setEspEsperada}
          suffix="mm"
          hint="Largura da linha configurada (ex.: 0,4)."
        />
        <ToolField
          label="Espessura medida"
          value={espMedida}
          onChange={setEspMedida}
          suffix="mm"
          hint="Média de algumas medições com paquímetro."
        />
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Novo fluxo
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {fmt(novoFlow, 1)}%
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <h2 className="font-semibold">E-steps (passos/mm)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Mande extrudar 100 mm, meça quanto saiu e corrija os passos.
          </p>
        </div>
        <ToolField
          label="Passos atuais"
          value={passosAtuais}
          onChange={setPassosAtuais}
          suffix="steps/mm"
        />
        <ToolField
          label="Comprimento pedido"
          value={pedido}
          onChange={setPedido}
          suffix="mm"
          hint="Quanto você mandou extrudar."
        />
        <ToolField
          label="Comprimento real"
          value={real}
          onChange={setReal}
          suffix="mm"
          hint="Quanto saiu de verdade."
        />
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Novos passos
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {fmt(novosPassos, 2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aplique com <code className="rounded bg-background/60 px-1">M92 E{fmt(novosPassos, 2)}</code> +{" "}
            <code className="rounded bg-background/60 px-1">M500</code>.
          </p>
        </div>
        <ToolRow
          label="Diferença"
          value={`${fmt(novosPassos - parseNum(passosAtuais), 2)} steps/mm`}
        />
      </section>
    </div>
  );
}
