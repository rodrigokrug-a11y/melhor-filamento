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

export function ScaleCalculator() {
  const [original, setOriginal] = useState("100");
  const [mode, setMode] = useState<"escala" | "alvo">("escala");
  const [escalaPct, setEscalaPct] = useState("150");
  const [alvo, setAlvo] = useState("150");
  const [peso, setPeso] = useState("20");
  const [precoKg, setPrecoKg] = useState("120");

  const orig = parseNum(original);
  let escala = 0;
  let novaMedida = 0;
  if (mode === "escala") {
    escala = parseNum(escalaPct);
    novaMedida = (orig * escala) / 100;
  } else {
    novaMedida = parseNum(alvo);
    escala = orig > 0 ? (novaMedida / orig) * 100 : 0;
  }
  const fator = escala / 100;
  // Volume (e material/peso) escala com o cubo do fator linear.
  const multVolume = Math.pow(fator, 3);
  const novoPeso = parseNum(peso) * multVolume;
  const novoCusto = (novoPeso / 1000) * parseNum(precoKg);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ToolField
            label="Medida original"
            value={original}
            onChange={setOriginal}
            suffix="mm"
            hint="Uma dimensão de referência da peça."
          />
          <div>
            <span className="text-sm font-medium">Redimensionar por:</span>
            <div className="mt-1.5 inline-flex rounded-lg border bg-background p-0.5 text-sm">
              {(["escala", "alvo"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    mode === m
                      ? "bg-brand text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "escala" ? "Escala (%)" : "Medida alvo"}
                </button>
              ))}
            </div>
          </div>
          {mode === "escala" ? (
            <ToolField
              label="Escala"
              value={escalaPct}
              onChange={setEscalaPct}
              suffix="%"
            />
          ) : (
            <ToolField
              label="Medida desejada"
              value={alvo}
              onChange={setAlvo}
              suffix="mm"
            />
          )}
        </div>

        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <ToolField
            label="Peso original (opcional)"
            value={peso}
            onChange={setPeso}
            suffix="g"
            hint="Pra estimar o novo peso/custo."
          />
          <ToolField
            label="Preço do filamento"
            value={precoKg}
            onChange={setPrecoKg}
            suffix="R$/kg"
          />
        </div>
      </div>

      <ToolResult>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Resultado
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {fmt(escala)}% · {fmt(novaMedida)} mm
          </p>
        </div>
        <div className="space-y-2 border-t pt-3">
          <ToolRow label="Escala linear" value={`${fmt(escala)}%`} />
          <ToolRow label="Nova medida" value={`${fmt(novaMedida)} mm`} />
          <ToolRow
            label="Material / peso"
            value={`× ${fmt(multVolume, 2)}`}
            strong
          />
          <ToolRow label="Novo peso (aprox.)" value={`${fmt(novoPeso)} g`} />
          <ToolRow label="Novo custo (aprox.)" value={formatBRL(novoCusto)} />
        </div>
        <p className="text-xs text-muted-foreground">
          O material escala com o <strong>cubo</strong> da escala (2× maior =
          8× de filamento). O tempo de impressão cresce de forma parecida, mas
          varia com o fatiamento.
        </p>
      </ToolResult>
    </div>
  );
}
