"use client";

import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import {
  ToolField,
  ToolResult,
  ToolRow,
  fmt,
  inputClass,
  parseNum,
} from "@/components/tool-ui";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatBRL } from "@/lib/utils";

const DENSITIES: Record<string, number> = {
  PLA: 1.24,
  PETG: 1.27,
  ABS: 1.04,
  ASA: 1.07,
  TPU: 1.21,
  "Nylon (PA)": 1.14,
  PC: 1.2,
};

/** "1d 2h 3m 4s" / "1h2m3s" → horas. */
function parseDuration(s: string): number {
  let h = 0;
  const d = s.match(/(\d+)\s*d/i);
  if (d) h += parseInt(d[1], 10) * 24;
  const hh = s.match(/(\d+)\s*h/i);
  if (hh) h += parseInt(hh[1], 10);
  const m = s.match(/(\d+)\s*m(?!s)/i);
  if (m) h += parseInt(m[1], 10) / 60;
  const sec = s.match(/(\d+)\s*s/i);
  if (sec) h += parseInt(sec[1], 10) / 3600;
  return h;
}

/** Extrai peso (g), comprimento (m) e tempo (h) dos comentários do G-code. */
function parseGcode(text: string): {
  grams: number | null;
  meters: number | null;
  hours: number | null;
} {
  let grams: number | null = null;
  let meters: number | null = null;
  let hours: number | null = null;

  // Peso (PrusaSlicer/Orca/Bambu): "; filament used [g] = 12.3"
  let mt = text.match(/filament used\s*\[g\]\s*=\s*([\d.]+)/i);
  if (mt) grams = parseFloat(mt[1]);
  if (grams == null) {
    mt = text.match(/total filament weight[^:=]*[:=]\s*([\d.]+)/i);
    if (mt) grams = parseFloat(mt[1]);
  }

  // Comprimento (PrusaSlicer/Orca): "; filament used [mm] = 1234.5"
  mt = text.match(/filament used\s*\[mm\]\s*=\s*([\d.]+)/i);
  if (mt) meters = parseFloat(mt[1]) / 1000;
  // Cura: ";Filament used: 1.234m"
  if (meters == null) {
    mt = text.match(/Filament used:\s*([\d.]+)\s*m/i);
    if (mt) meters = parseFloat(mt[1]);
  }

  // Tempo — Cura: ";TIME:3600" (segundos)
  mt = text.match(/;\s*TIME:\s*(\d+)/i);
  if (mt) hours = parseInt(mt[1], 10) / 3600;
  // PrusaSlicer/Orca/Bambu: "...estimated...time... = 1h 2m 3s"
  if (hours == null) {
    mt = text.match(/estimated[^=:\n]*time[^=:\n]*[=:]\s*([0-9hdms\s]+)/i);
    if (mt) hours = parseDuration(mt[1]);
  }

  return { grams, meters, hours };
}

export function GcodeCostCalculator() {
  const [pasted, setPasted] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [precoKg, setPrecoKg] = useState("120");
  const [potencia, setPotencia] = useState("150");
  const [precoKwh, setPrecoKwh] = useState("0,95");
  const [material, setMaterial] = useState("PLA");
  const [diam, setDiam] = useState("1.75");

  const source = pasted.trim() ? pasted : fileText;
  const parsed = parseGcode(source);
  const detected =
    parsed.grams != null || parsed.meters != null || parsed.hours != null;

  const density = DENSITIES[material] ?? 1.24;
  const gPorMetro = Math.PI * Math.pow(parseNum(diam) / 2, 2) * density;
  const grams =
    parsed.grams ?? (parsed.meters != null ? parsed.meters * gPorMetro : null);
  const needsDensity = parsed.grams == null && parsed.meters != null;

  const custoMaterial = grams != null ? (grams / 1000) * parseNum(precoKg) : 0;
  const custoEnergia =
    parsed.hours != null
      ? (parseNum(potencia) / 1000) * parsed.hours * parseNum(precoKwh)
      : 0;
  const custoTotal = custoMaterial + custoEnergia;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    setFileName(f.name);
    setPasted("");
    try {
      // Os comentários (peso/tempo) ficam no início e no fim — leio só 400 KB.
      const head = await f.slice(0, 200_000).text();
      const tail = await f.slice(Math.max(0, f.size - 200_000)).text();
      setFileText(head + "\n" + tail);
    } catch {
      setFileText("");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <label
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit cursor-pointer",
              loading && "pointer-events-none opacity-60",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileUp />
            )}
            {fileName ?? "Abrir arquivo .gcode"}
            <input
              type="file"
              accept=".gcode,.gco,.g,.nc,text/plain"
              className="hidden"
              onChange={onFile}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Funciona com Cura, PrusaSlicer, OrcaSlicer e Bambu Studio. Ou cole o
            resumo do fatiador abaixo.
          </p>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={4}
            placeholder="…ou cole aqui o resumo (ex.: 'filament used [g] = 12.3' e o tempo estimado)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {source.trim() && !detected ? (
            <p className="text-xs text-amber-600">
              Não encontrei peso/tempo nesse conteúdo. Confira se é um G-code
              fatiado (com os comentários do fatiador).
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
          <ToolField
            label="Preço do filamento"
            value={precoKg}
            onChange={setPrecoKg}
            suffix="R$/kg"
          />
          {needsDensity ? (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Material</span>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className={inputClass}
                >
                  {Object.keys(DENSITIES).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Diâmetro</span>
                <select
                  value={diam}
                  onChange={(e) => setDiam(e.target.value)}
                  className={inputClass}
                >
                  <option value="1.75">1.75 mm</option>
                  <option value="2.85">2.85 mm</option>
                </select>
              </label>
            </>
          ) : null}
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
        </section>
      </div>

      <ToolResult>
        <ToolRow
          label="Filamento"
          value={grams != null ? `${fmt(grams)} g` : "—"}
        />
        <ToolRow
          label="Comprimento"
          value={parsed.meters != null ? `${fmt(parsed.meters)} m` : "—"}
        />
        <ToolRow
          label="Tempo"
          value={parsed.hours != null ? `${fmt(parsed.hours, 2)} h` : "—"}
        />
        <div className="space-y-2 border-t pt-3">
          <ToolRow label="Material" value={formatBRL(custoMaterial)} />
          <ToolRow label="Energia" value={formatBRL(custoEnergia)} />
        </div>
        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Custo total
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">
            {formatBRL(custoTotal)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Lê o peso e o tempo direto do G-code. Tudo no navegador — o arquivo não
          é enviado a lugar nenhum.
        </p>
      </ToolResult>
    </div>
  );
}
