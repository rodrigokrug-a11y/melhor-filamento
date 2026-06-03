"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { inputClass } from "@/components/tool-ui";

type Mat = {
  nome: string;
  bico: string;
  mesa: string;
  resistencia: string;
  flexibilidade: string;
  facilidade: string;
  usos: string;
};

const MATERIAIS: Mat[] = [
  {
    nome: "PLA",
    bico: "190–220 °C",
    mesa: "50–60 °C",
    resistencia: "Média",
    flexibilidade: "Baixa",
    facilidade: "Fácil",
    usos: "Protótipos, decoração, peças sem calor.",
  },
  {
    nome: "PETG",
    bico: "230–250 °C",
    mesa: "70–85 °C",
    resistencia: "Alta",
    flexibilidade: "Baixa–média",
    facilidade: "Média",
    usos: "Peças funcionais, resistentes à água.",
  },
  {
    nome: "ABS",
    bico: "230–260 °C",
    mesa: "90–110 °C",
    resistencia: "Alta",
    flexibilidade: "Baixa",
    facilidade: "Difícil",
    usos: "Resistência a calor/impacto (câmara fechada).",
  },
  {
    nome: "ASA",
    bico: "240–260 °C",
    mesa: "90–110 °C",
    resistencia: "Alta",
    flexibilidade: "Baixa",
    facilidade: "Difícil",
    usos: "Uso externo, resistente a UV e tempo.",
  },
  {
    nome: "TPU",
    bico: "210–235 °C",
    mesa: "30–50 °C",
    resistencia: "Média",
    flexibilidade: "Alta",
    facilidade: "Média",
    usos: "Peças flexíveis, capas, vedações.",
  },
  {
    nome: "Nylon (PA)",
    bico: "240–270 °C",
    mesa: "70–90 °C",
    resistencia: "Muito alta",
    flexibilidade: "Média",
    facilidade: "Difícil",
    usos: "Engrenagens, peças mecânicas (absorve umidade).",
  },
  {
    nome: "PC",
    bico: "260–290 °C",
    mesa: "90–120 °C",
    resistencia: "Muito alta",
    flexibilidade: "Baixa",
    facilidade: "Difícil",
    usos: "Engenharia, alta temperatura e impacto.",
  },
];

const ROWS: { label: string; key: keyof Mat }[] = [
  { label: "Temp. do bico", key: "bico" },
  { label: "Temp. da mesa", key: "mesa" },
  { label: "Resistência", key: "resistencia" },
  { label: "Flexibilidade", key: "flexibilidade" },
  { label: "Facilidade", key: "facilidade" },
  { label: "Usos típicos", key: "usos" },
];

export function MaterialComparator() {
  const [selected, setSelected] = useState<string[]>(["PLA", "PETG", "ABS"]);

  const cols = selected
    .map((n) => MATERIAIS.find((m) => m.nome === n))
    .filter((m): m is Mat => Boolean(m));
  const disponiveis = MATERIAIS.filter((m) => !selected.includes(m.nome));

  function add(nome: string) {
    if (nome && !selected.includes(nome) && selected.length < 4) {
      setSelected([...selected, nome]);
    }
  }
  function remove(nome: string) {
    setSelected(selected.filter((n) => n !== nome));
  }

  return (
    <div className="space-y-4">
      {selected.length < 4 ? (
        <select
          value=""
          onChange={(e) => add(e.target.value)}
          className={`${inputClass} max-w-xs`}
          aria-label="Adicionar material"
        >
          <option value="">+ Adicionar material…</option>
          {disponiveis.map((m) => (
            <option key={m.nome} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-muted-foreground">
          Máximo de 4. Remova um para trocar.
        </p>
      )}

      {cols.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Escolha materiais para comparar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[420px] table-fixed text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-28 p-3 text-left align-bottom text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-32">
                  Material
                </th>
                {cols.map((m) => (
                  <th key={m.nome} className="border-l p-3 text-left align-bottom">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-display font-semibold">{m.nome}</span>
                      <button
                        type="button"
                        onClick={() => remove(m.nome)}
                        aria-label={`Remover ${m.nome}`}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="p-3 align-top text-muted-foreground">
                    {row.label}
                  </td>
                  {cols.map((m) => (
                    <td key={m.nome} className="border-l p-3 align-top">
                      {m[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Valores de referência — confira sempre a ficha do fabricante. Veja mais
        em Dicas.
      </p>
    </div>
  );
}
