"use client";

import { useState } from "react";
import { Loader2, LocateFixed, MapPin } from "lucide-react";

import { useRegion } from "@/components/use-region";
import { Button } from "@/components/ui/button";
import { ufFromCoords } from "@/lib/geo";
import { REGION_LABELS, deriveRegion } from "@/lib/shipping";
import { cn } from "@/lib/utils";
import { lookupCep } from "@/lib/viacep";

export function CepSelector() {
  const { region, setRegion, clear } = useRegion();
  const [open, setOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = region
    ? region.localidade
      ? `${region.localidade} · ${region.uf}`
      : `${REGION_LABELS[region.region]} · ${region.uf}`
    : "Informar CEP";

  async function handleCep(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await lookupCep(cep);
      const reg = deriveRegion(r.uf);
      if (!reg) throw new Error("UF não reconhecida.");
      setRegion({ uf: r.uf, region: reg, cep: r.cep, localidade: r.localidade });
      setOpen(false);
      setCep("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao consultar o CEP.");
    } finally {
      setLoading(false);
    }
  }

  function handleLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocalização indisponível neste navegador.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const uf = await ufFromCoords(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          const reg = deriveRegion(uf);
          if (!reg) throw new Error("Região não reconhecida.");
          setRegion({ uf, region: reg, cep: null, localidade: null });
          setOpen(false);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Erro ao usar a localização.",
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Não foi possível obter sua localização.");
        setLoading(false);
      },
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-expanded={open}
      >
        <MapPin className="size-4 text-brand" />
        <span className="hidden max-w-[120px] truncate sm:inline">{label}</span>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md">
            <form onSubmit={handleCep} className="space-y-2">
              <label
                htmlFor="cep-input"
                className="block text-xs font-medium text-muted-foreground"
              >
                Informe seu CEP para ver o frete
              </label>
              <div className="flex gap-2">
                <input
                  id="cep-input"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  maxLength={9}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "OK"
                  )}
                </Button>
              </div>
            </form>

            <button
              type="button"
              onClick={handleLocation}
              disabled={loading}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50"
            >
              <LocateFixed className="size-4" />
              Usar minha localização
            </button>

            {error ? (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            ) : null}

            {region ? (
              <button
                type="button"
                onClick={() => {
                  clear();
                  setOpen(false);
                }}
                className={cn(
                  "mt-3 block text-xs text-muted-foreground hover:text-foreground",
                )}
              >
                Limpar localização
              </button>
            ) : null}

            <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
              Usamos sua região apenas para estimar o frete das ofertas.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
