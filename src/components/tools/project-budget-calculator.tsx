"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  ToolField,
  ToolResult,
  ToolRow,
  fmt,
  inputClass,
  parseNum,
} from "@/components/tool-ui";
import { formatBRL } from "@/lib/utils";

type Part = { id: number; nome: string; peso: string; tempo: string };

export function ProjectBudgetCalculator() {
  const [precoKg, setPrecoKg] = useState("120");
  const [potencia, setPotencia] = useState("150");
  const [precoKwh, setPrecoKwh] = useState("0,95");
  const [margemPct, setMargemPct] = useState("0");
  const [parts, setParts] = useState<Part[]>([
    { id: 1, nome: "Peça 1", peso: "30", tempo: "2" },
    { id: 2, nome: "Peça 2", peso: "15", tempo: "1" },
  ]);

  function update(id: number, field: keyof Part, value: string) {
    setParts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }
  function add() {
    setParts((ps) => {
      const nextId = ps.reduce((m, p) => Math.max(m, p.id), 0) + 1;
      return [
        ...ps,
        { id: nextId, nome: `Peça ${ps.length + 1}`, peso: "", tempo: "" },
      ];
    });
  }
  function remove(id: number) {
    setParts((ps) => ps.filter((p) => p.id !== id));
  }

  const kgPrice = parseNum(precoKg);
  const pot = parseNum(potencia);
  const kwh = parseNum(precoKwh);

  let pesoTotal = 0;
  let tempoTotal = 0;
  let custoTotal = 0;
  for (const p of parts) {
    const peso = parseNum(p.peso);
    const tempo = parseNum(p.tempo);
    pesoTotal += peso;
    tempoTotal += tempo;
    custoTotal += (peso / 1000) * kgPrice + (pot / 1000) * tempo * kwh;
  }
  const precoSugerido = custoTotal * (1 + parseNum(margemPct) / 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Peças do projeto</h2>
          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_80px_80px_36px] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
              <span>Nome</span>
              <span>Peso (g)</span>
              <span>Tempo (h)</span>
              <span />
            </div>
            {parts.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_70px_70px_36px] items-center gap-2"
              >
                <input
                  value={p.nome}
                  onChange={(e) => update(p.id, "nome", e.target.value)}
                  className={inputClass}
                />
                <input
                  value={p.peso}
                  onChange={(e) => update(p.id, "peso", e.target.value)}
                  inputMode="decimal"
                  className={inputClass}
                />
                <input
                  value={p.tempo}
                  onChange={(e) => update(p.id, "tempo", e.target.value)}
                  inputMode="decimal"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remover ${p.nome}`}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={add}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" />
            Adicionar peça
          </button>
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
          <ToolField
            label="Preço do filamento"
            value={precoKg}
            onChange={setPrecoKg}
            suffix="R$/kg"
          />
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
          <ToolField
            label="Margem de lucro"
            value={margemPct}
            onChange={setMargemPct}
            suffix="%"
          />
        </section>
      </div>

      <ToolResult>
        <ToolRow label="Peças" value={`${parts.length}`} />
        <ToolRow label="Peso total" value={`${fmt(pesoTotal)} g`} />
        <ToolRow label="Tempo total" value={`${fmt(tempoTotal)} h`} />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="font-medium">Custo total</span>
          <span className="font-display text-xl font-bold tabular-nums">
            {formatBRL(custoTotal)}
          </span>
        </div>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Preço sugerido
            {parseNum(margemPct) > 0 ? ` (margem ${fmt(parseNum(margemPct))}%)` : ""}
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {formatBRL(precoSugerido)}
          </p>
        </div>
      </ToolResult>
    </div>
  );
}
