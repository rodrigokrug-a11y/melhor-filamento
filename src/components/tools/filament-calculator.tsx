"use client";

import { useState } from "react";

import {
  ToolField,
  ToolResult,
  ToolRow,
  fmt,
  inputClass,
  parseNum,
} from "@/components/tool-ui";
import { formatBRL } from "@/lib/utils";

// Densidades típicas (g/cm³) por material.
const MATERIALS: { label: string; density: number }[] = [
  { label: "PLA", density: 1.24 },
  { label: "PETG", density: 1.27 },
  { label: "ABS", density: 1.04 },
  { label: "ASA", density: 1.07 },
  { label: "TPU", density: 1.21 },
  { label: "Nylon (PA)", density: 1.14 },
  { label: "PC", density: 1.2 },
];

const DIAMS = ["1.75", "2.85", "3.0"];

export function FilamentCalculator() {
  const [material, setMaterial] = useState("PLA");
  const [density, setDensity] = useState("1,24");
  const [diam, setDiam] = useState("1.75");
  const [preco, setPreco] = useState("120");
  const [mode, setMode] = useState<"peso" | "comprimento">("peso");
  const [peso, setPeso] = useState("20");
  const [comp, setComp] = useState("6,7");

  const d = parseNum(diam);
  const rho = parseNum(density);
  // gramas por metro = π·(d/2)²·densidade  (d em mm, densidade g/cm³)
  const gPorMetro = Math.PI * Math.pow(d / 2, 2) * rho;
  const mPorKg = gPorMetro > 0 ? 1000 / gPorMetro : 0;

  let outPeso = 0;
  let outComp = 0;
  if (mode === "peso") {
    outPeso = parseNum(peso);
    outComp = gPorMetro > 0 ? outPeso / gPorMetro : 0;
  } else {
    outComp = parseNum(comp);
    outPeso = outComp * gPorMetro;
  }
  const custo = (outPeso / 1000) * parseNum(preco);

  function onMaterial(label: string) {
    setMaterial(label);
    const m = MATERIALS.find((x) => x.label === label);
    if (m) setDensity(String(m.density).replace(".", ","));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Material</span>
            <select
              value={material}
              onChange={(e) => onMaterial(e.target.value)}
              className={inputClass}
            >
              {MATERIALS.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <ToolField
            label="Densidade"
            value={density}
            onChange={setDensity}
            suffix="g/cm³"
            hint="Ajuste se o fabricante informar outra."
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Diâmetro</span>
            <select
              value={diam}
              onChange={(e) => setDiam(e.target.value)}
              className={inputClass}
            >
              {DIAMS.map((x) => (
                <option key={x} value={x}>
                  {x} mm
                </option>
              ))}
            </select>
          </label>
          <ToolField
            label="Preço do filamento"
            value={preco}
            onChange={setPreco}
            suffix="R$/kg"
          />
        </div>

        <div>
          <span className="text-sm font-medium">Calcular a partir de:</span>
          <div className="mt-1.5 inline-flex rounded-lg border bg-background p-0.5 text-sm">
            {(["peso", "comprimento"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1.5 capitalize transition-colors ${
                  mode === m
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {mode === "peso" ? (
          <ToolField
            label="Peso da peça / do filamento"
            value={peso}
            onChange={setPeso}
            suffix="g"
          />
        ) : (
          <ToolField
            label="Comprimento do filamento"
            value={comp}
            onChange={setComp}
            suffix="m"
          />
        )}
      </div>

      <ToolResult>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            {mode === "peso" ? "Comprimento" : "Peso"}
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {mode === "peso" ? `${fmt(outComp)} m` : `${fmt(outPeso)} g`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Custo do material:{" "}
            <span className="font-medium text-foreground">
              {formatBRL(custo)}
            </span>
          </p>
        </div>
        <div className="space-y-2 border-t pt-3">
          <ToolRow label="Gramas por metro" value={`${fmt(gPorMetro)} g`} />
          <ToolRow label="Metros por quilo" value={`${fmt(mPorKg)} m`} />
          <ToolRow
            label="Custo por metro"
            value={formatBRL((gPorMetro / 1000) * parseNum(preco))}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Útil pra saber quanto sobra no rolo (pese o rolo, tire o peso do
          carretel vazio) e quantas peças ainda dá pra imprimir.
        </p>
      </ToolResult>
    </div>
  );
}
