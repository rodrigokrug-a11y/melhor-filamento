"use client";

import { useState } from "react";
import { Boxes, Plug, Receipt, Tag } from "lucide-react";

import { formatBRL } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Values = {
  pesoG: string;
  precoKg: string;
  horas: string;
  minutos: string;
  potenciaW: string;
  precoKwh: string;
  desgasteHora: string;
  maoDeObra: string;
  falhaPct: string;
  margemPct: string;
};

const DEFAULTS: Values = {
  pesoG: "20",
  precoKg: "120",
  horas: "2",
  minutos: "0",
  potenciaW: "150",
  precoKwh: "0,95",
  desgasteHora: "0",
  maoDeObra: "0",
  falhaPct: "5",
  margemPct: "0",
};

/** Converte texto em número >= 0, aceitando vírgula ou ponto como decimal.
 *  Com vírgula: ponto vira milhar (formato BR, ex.: "1.234,50"). Sem vírgula:
 *  ponto é o decimal (ex.: "0.95"). */
function n(v: string): number {
  const s = v.trim();
  const cleaned = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : s;
  const f = parseFloat(cleaned);
  return Number.isFinite(f) && f >= 0 ? f : 0;
}

function Field({
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {suffix ? (
          <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function CostCalculator() {
  const [v, setV] = useState<Values>(DEFAULTS);
  const set = (k: keyof Values) => (val: string) =>
    setV((s) => ({ ...s, [k]: val }));

  const tempoH = n(v.horas) + n(v.minutos) / 60;
  const custoMaterial = (n(v.pesoG) / 1000) * n(v.precoKg);
  const custoEnergia = (n(v.potenciaW) / 1000) * tempoH * n(v.precoKwh);
  const custoDesgaste = n(v.desgasteHora) * tempoH;
  const maoDeObra = n(v.maoDeObra);
  const subtotal = custoMaterial + custoEnergia + custoDesgaste + maoDeObra;
  const reservaFalha = subtotal * (n(v.falhaPct) / 100);
  const custoTotal = subtotal + reservaFalha;
  const precoSugerido = custoTotal * (1 + n(v.margemPct) / 100);
  const lucro = precoSugerido - custoTotal;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Entradas */}
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Boxes className="size-4 text-brand" />
            Material
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Peso da peça"
              value={v.pesoG}
              onChange={set("pesoG")}
              suffix="g"
              hint="Veja no fatiador (Cura, Orca, etc.)."
            />
            <Field
              label="Preço do filamento"
              value={v.precoKg}
              onChange={set("precoKg")}
              suffix="R$/kg"
              hint="Compare no catálogo do site 😉"
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Plug className="size-4 text-brand" />
            Energia
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Tempo (h)" value={v.horas} onChange={set("horas")} />
              <Field label="(min)" value={v.minutos} onChange={set("minutos")} />
            </div>
            <Field
              label="Potência da impressora"
              value={v.potenciaW}
              onChange={set("potenciaW")}
              suffix="W"
              hint="FDM ~100–250 W; resina ~50–100 W."
            />
            <Field
              label="Preço da energia"
              value={v.precoKwh}
              onChange={set("precoKwh")}
              suffix="R$/kWh"
              hint="Está na sua conta de luz."
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Receipt className="size-4 text-brand" />
            Extras
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Desgaste / manutenção"
              value={v.desgasteHora}
              onChange={set("desgasteHora")}
              suffix="R$/h"
              hint="Bico, correias, mesa… ex.: 0,50."
            />
            <Field
              label="Mão de obra / preparo"
              value={v.maoDeObra}
              onChange={set("maoDeObra")}
              suffix="R$"
              hint="Modelagem, pós-processamento (valor fixo)."
            />
            <Field
              label="Taxa de falha"
              value={v.falhaPct}
              onChange={set("falhaPct")}
              suffix="%"
              hint="Reserva para impressões que dão errado."
            />
            <Field
              label="Margem de lucro"
              value={v.margemPct}
              onChange={set("margemPct")}
              suffix="%"
              hint="Para quem vende impressões."
            />
          </div>
        </section>
      </div>

      {/* Resultado */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Tag className="size-4 text-brand" />
            Resultado
          </h2>
          <div className="mt-4 space-y-2 border-b pb-4">
            <Row label="Material" value={formatBRL(custoMaterial)} muted />
            <Row label="Energia" value={formatBRL(custoEnergia)} muted />
            {custoDesgaste > 0 ? (
              <Row label="Desgaste" value={formatBRL(custoDesgaste)} muted />
            ) : null}
            {maoDeObra > 0 ? (
              <Row label="Mão de obra" value={formatBRL(maoDeObra)} muted />
            ) : null}
            {reservaFalha > 0 ? (
              <Row
                label={`Reserva p/ falhas (${n(v.falhaPct)}%)`}
                value={formatBRL(reservaFalha)}
                muted
              />
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <span className="font-medium">Custo total</span>
            <span className="font-display text-xl font-bold tabular-nums">
              {formatBRL(custoTotal)}
            </span>
          </div>

          <div className="rounded-xl bg-brand-soft/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-brand">
              Preço de venda sugerido
              {n(v.margemPct) > 0 ? ` (margem ${n(v.margemPct)}%)` : ""}
            </p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">
              {formatBRL(precoSugerido)}
            </p>
            {lucro > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Lucro estimado:{" "}
                <span className="font-medium text-foreground">
                  {formatBRL(lucro)}
                </span>
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setV(DEFAULTS)}
            className="mt-4 w-full rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Restaurar valores
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Estimativa para ajudar na precificação. Ajuste os valores à sua
            realidade — nada é enviado a lugar nenhum, o cálculo é todo no seu
            navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
