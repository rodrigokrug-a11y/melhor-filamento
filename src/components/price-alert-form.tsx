"use client";

import { useState } from "react";
import { Bell, CircleCheck, Loader2 } from "lucide-react";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function parseBRL(v: string): number {
  const s = v.trim();
  const cleaned = s.includes(",")
    ? s.replace(/[^\d,]/g, "").replace(",", ".")
    : s.replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function PriceAlertForm({
  productId,
  suggestedPrice,
}: {
  productId: string;
  suggestedPrice: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState(
    suggestedPrice != null ? suggestedPrice.toFixed(2) : "",
  );
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const targetPrice = parseBRL(price);
    if (targetPrice <= 0) {
      setError("Informe um preço-alvo válido.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/alerta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId, targetPrice }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar o alerta.");
        return;
      }
      setSent(true);
    } catch {
      setError("Não foi possível criar o alerta.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-brand-soft/40 p-4">
        <CircleCheck className="size-6 shrink-0 text-emerald-500" />
        <div>
          <p className="font-medium">Alerta criado!</p>
          <p className="text-sm text-muted-foreground">
            Vamos te avisar por e-mail quando o preço baixar. Confira sua caixa
            de entrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2 font-medium">
            <Bell className="size-5 text-brand" />
            Avise-me quando o preço baixar
          </span>
          <span className="text-sm text-brand">criar alerta →</span>
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="flex items-center gap-2 font-medium">
            <Bell className="size-5 text-brand" />
            Alerta de preço
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">
                Seu e-mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">
                Avisar quando ficar abaixo de (R$)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className={inputClass}
              />
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="grad-brand inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-px disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Bell className="size-4" />
              )}
              Criar alerta
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              cancelar
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sem cadastro. Você recebe um e-mail e pode cancelar quando quiser.
          </p>
        </form>
      )}
    </div>
  );
}
