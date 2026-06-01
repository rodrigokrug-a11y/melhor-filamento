"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitTip } from "@/lib/tip-actions";
import { cn } from "@/lib/utils";

const initialState: { error?: string; ok?: boolean } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TipForm({
  material,
  materialLabel,
}: {
  material: string;
  materialLabel: string;
}) {
  const [state, formAction, pending] = useActionState(submitTip, initialState);

  if (state.ok) {
    return (
      <div className="rounded-xl border bg-card p-4 text-sm text-emerald-700">
        Obrigado! Sua dica foi enviada e aparece após a moderação.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border bg-card p-4">
      <p className="text-sm font-medium">Compartilhar dica de {materialLabel}</p>
      <input type="hidden" name="material" value={material} />

      <textarea
        name="notes"
        required
        rows={4}
        placeholder="Conte sua configuração e o que funcionou: retração, refrigeração, adesão à mesa, secagem…"
        aria-label="Dica"
        className={cn(inputClass, "h-auto py-2")}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          Temp. bico (°C)
          <input
            name="nozzleTempC"
            type="number"
            inputMode="numeric"
            min={150}
            max={350}
            placeholder="210"
            aria-label="Temperatura do bico"
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Temp. mesa (°C)
          <input
            name="bedTempC"
            type="number"
            inputMode="numeric"
            min={0}
            max={150}
            placeholder="60"
            aria-label="Temperatura da mesa"
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Velocidade (mm/s)
          <input
            name="speedMms"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            placeholder="50"
            aria-label="Velocidade"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="authorName"
          required
          placeholder="Seu nome"
          autoComplete="name"
          aria-label="Seu nome"
          className={inputClass}
        />
        <input
          name="authorEmail"
          type="email"
          placeholder="E-mail (opcional)"
          autoComplete="email"
          aria-label="E-mail"
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Enviar dica
      </Button>
    </form>
  );
}
