"use client";

import { useState } from "react";
import { CircleCheck, Loader2, Mail } from "lucide-react";

// Captação de leads OPT-IN e não-bloqueante (newsletter de ofertas).
// Não condiciona acesso a nenhum conteúdo — evita o padrão "engenharia social"
// que o Safe Browsing penaliza.
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Não foi possível inscrever.");
        return;
      }
      setSent(true);
    } catch {
      setError("Não foi possível inscrever. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white">
        <CircleCheck className="size-5 shrink-0 text-[var(--green-400)]" />
        Pronto! Você vai receber as melhores ofertas.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full sm:w-auto">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7fa9a4]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            aria-label="Seu e-mail"
            className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-[#6f8b88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal-400)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="grad-brand inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Quero receber
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-300">{error}</p>
      ) : (
        <p className="mt-2 text-[11px] text-[#7fa9a4]">
          Opt-in, sem spam. Cancele quando quiser.
        </p>
      )}
    </form>
  );
}
