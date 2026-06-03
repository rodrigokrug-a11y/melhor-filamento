"use client";

import { useActionState } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";

import { submitRecipe } from "@/app/receitas/actions";

const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "ASA", "PCTG", "NYLON"];

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelCls = "flex flex-col gap-1 text-sm";
const capCls = "text-xs font-medium text-muted-foreground";

export function RecipeForm() {
  const [state, formAction, pending] = useActionState(submitRecipe, {});

  if (state.ok) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-brand-soft/40 p-5">
        <CircleCheck className="size-6 shrink-0 text-emerald-500" />
        <div>
          <p className="font-medium">Receita enviada!</p>
          <p className="text-sm text-muted-foreground">
            Obrigado por contribuir. Vamos revisar e publicar em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          <span className={capCls}>Material</span>
          <select name="material" required className={inputClass} defaultValue="PLA">
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          <span className={capCls}>Impressora (marca/modelo)</span>
          <input
            name="printer"
            required
            maxLength={80}
            placeholder="Ex.: Ender 3 V2, Bambu A1…"
            className={inputClass}
          />
        </label>
        <label className={labelCls}>
          <span className={capCls}>Temp. do bico (°C)</span>
          <input name="nozzleTempC" type="number" required className={inputClass} placeholder="210" />
        </label>
        <label className={labelCls}>
          <span className={capCls}>Temp. da mesa (°C)</span>
          <input name="bedTempC" type="number" required className={inputClass} placeholder="60" />
        </label>
        <label className={labelCls}>
          <span className={capCls}>Velocidade (mm/s) — opcional</span>
          <input name="speedMms" type="number" className={inputClass} placeholder="60" />
        </label>
        <label className={labelCls}>
          <span className={capCls}>Retração (mm) — opcional</span>
          <input name="retractionMm" type="text" inputMode="decimal" className={inputClass} placeholder="0,8" />
        </label>
        <label className={labelCls}>
          <span className={capCls}>Fluxo (%) — opcional</span>
          <input name="flowPct" type="number" className={inputClass} placeholder="100" />
        </label>
        <label className={labelCls}>
          <span className={capCls}>Ventoinha (%) — opcional</span>
          <input name="fanPct" type="number" className={inputClass} placeholder="100" />
        </label>
      </div>
      <label className={labelCls}>
        <span className={capCls}>Observações (adesão, dicas…) — opcional</span>
        <textarea
          name="notes"
          rows={3}
          maxLength={1000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="O que funcionou bem? Algum truque?"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          <span className={capCls}>Seu nome</span>
          <input name="authorName" required maxLength={60} className={inputClass} />
        </label>
        <label className={labelCls}>
          <span className={capCls}>E-mail (opcional, não aparece)</span>
          <input name="authorEmail" type="email" className={inputClass} />
        </label>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="grad-brand inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-px disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Enviar receita
      </button>
    </form>
  );
}
