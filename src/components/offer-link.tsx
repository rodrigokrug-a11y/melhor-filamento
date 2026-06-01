"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function hasLeadCookie(): boolean {
  return (
    typeof document !== "undefined" &&
    document.cookie.split("; ").some((c) => c.startsWith("mf_lead="))
  );
}

export function OfferLink({
  offerId,
  className,
}: {
  offerId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToOffer() {
    window.open(`/go/${offerId}`, "_blank", "noopener,noreferrer");
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (hasLeadCookie()) {
      goToOffer();
      return;
    }
    setOpen(true);
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, offerId }),
      });
      if (!res.ok) {
        setError("Verifique seu nome e e-mail.");
        return;
      }
      setOpen(false);
      goToOffer();
    } catch {
      setError("Não foi possível continuar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <a
        href={`/go/${offerId}`}
        onClick={handleClick}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className={cn(buttonVariants(), className)}
      >
        Ver oferta <ArrowUpRight />
      </a>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Acessar oferta"
        >
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Quase lá!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deixe seu nome e e-mail para acessar a oferta na loja.
            </p>
            <form onSubmit={submitLead} className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                autoComplete="name"
                aria-label="Seu nome"
                className={inputClass}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                aria-label="Seu e-mail"
                className={inputClass}
              />
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : null}
                  Ver oferta
                </Button>
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Usamos seu contato apenas para melhorar as ofertas que te
                mostramos.
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
