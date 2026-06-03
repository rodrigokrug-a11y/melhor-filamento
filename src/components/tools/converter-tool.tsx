"use client";

import { useState } from "react";

import { ToolRow, fmt, inputClass, parseNum } from "@/components/tool-ui";

function UnitToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-background p-0.5 text-sm">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            value === o
              ? "bg-brand text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ConverterTool() {
  // Temperatura
  const [tVal, setTVal] = useState("210");
  const [tUnit, setTUnit] = useState<"°C" | "°F">("°C");
  const t = parseNum(tVal);
  const tC = tUnit === "°C" ? t : ((t - 32) * 5) / 9;
  const tF = tUnit === "°C" ? (t * 9) / 5 + 32 : t;

  // Comprimento
  const [lVal, setLVal] = useState("10");
  const [lUnit, setLUnit] = useState<"mm" | "cm" | "pol">("mm");
  const l = parseNum(lVal);
  const mm = lUnit === "mm" ? l : lUnit === "cm" ? l * 10 : l * 25.4;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Temperatura</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={tVal}
            onChange={(e) => setTVal(e.target.value)}
            className={inputClass}
          />
          <UnitToggle
            options={["°C", "°F"] as const}
            value={tUnit}
            onChange={setTUnit}
          />
        </div>
        <div className="space-y-2 border-t pt-3">
          <ToolRow label="Celsius" value={`${fmt(tC, 1)} °C`} strong={tUnit === "°C"} />
          <ToolRow label="Fahrenheit" value={`${fmt(tF, 1)} °F`} strong={tUnit === "°F"} />
        </div>
        <p className="text-xs text-muted-foreground">
          Útil pra seguir perfis e guias em inglês.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Comprimento</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={lVal}
            onChange={(e) => setLVal(e.target.value)}
            className={inputClass}
          />
          <UnitToggle
            options={["mm", "cm", "pol"] as const}
            value={lUnit}
            onChange={setLUnit}
          />
        </div>
        <div className="space-y-2 border-t pt-3">
          <ToolRow label="Milímetros" value={`${fmt(mm, 2)} mm`} strong={lUnit === "mm"} />
          <ToolRow label="Centímetros" value={`${fmt(mm / 10, 2)} cm`} strong={lUnit === "cm"} />
          <ToolRow
            label="Polegadas"
            value={`${fmt(mm / 25.4, 3)} pol`}
            strong={lUnit === "pol"}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          1 polegada = 25,4 mm.
        </p>
      </section>
    </div>
  );
}
