"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { geocodeCep, updateSellerLocation } from "@/app/admin/lojas/actions";
import { Button } from "@/components/ui/button";

type Seller = {
  id: string;
  city: string | null;
  uf: string | null;
  latitude: number | null;
  longitude: number | null;
  offersPickup: boolean;
};

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SellerLocationForm({ seller }: { seller: Seller }) {
  const [state, formAction, pending] = useActionState(
    updateSellerLocation,
    {} as { error?: string; ok?: boolean },
  );

  const cepRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const ufRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  async function handleGeocode() {
    const cep = cepRef.current?.value ?? "";
    setGeocoding(true);
    setGeoError(null);
    try {
      const r = await geocodeCep(cep);
      if (r.error) {
        setGeoError(r.error);
        return;
      }
      if (r.city && cityRef.current) cityRef.current.value = r.city;
      if (r.uf && ufRef.current) ufRef.current.value = r.uf;
      if (r.latitude != null && latRef.current)
        latRef.current.value = String(r.latitude);
      if (r.longitude != null && lngRef.current)
        lngRef.current.value = String(r.longitude);
      if (r.latitude == null) {
        setGeoError("Cidade encontrada, mas sem coordenadas — ajuste manualmente.");
      }
    } catch {
      setGeoError("Não consegui buscar o CEP.");
    } finally {
      setGeocoding(false);
    }
  }

  const summary = seller.city
    ? `${seller.city}/${seller.uf ?? "?"}${seller.offersPickup ? " · retira" : ""}`
    : "não definida";

  return (
    <details className="mt-3 rounded-lg border bg-muted/20 text-sm">
      <summary className="cursor-pointer px-3 py-2 font-medium">
        <MapPin className="mr-1 inline size-3.5 text-brand" />
        Localização: <span className="text-muted-foreground">{summary}</span>
      </summary>
      <form action={formAction} className="space-y-3 border-t p-3">
        <input type="hidden" name="sellerId" value={seller.id} />

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            CEP (preenche cidade, UF e coordenadas)
          </label>
          <div className="flex gap-2">
            <input
              ref={cepRef}
              inputMode="numeric"
              placeholder="00000-000"
              className={inputClass}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGeocode}
              disabled={geocoding}
              className="shrink-0"
            >
              {geocoding ? <Loader2 className="animate-spin" /> : null}
              Buscar
            </Button>
          </div>
          {geoError ? (
            <p className="mt-1 text-xs text-amber-600">{geoError}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            name="city"
            ref={cityRef}
            defaultValue={seller.city ?? ""}
            placeholder="Cidade"
            aria-label="Cidade"
            className={inputClass}
          />
          <input
            name="uf"
            ref={ufRef}
            defaultValue={seller.uf ?? ""}
            maxLength={2}
            placeholder="UF"
            aria-label="UF"
            className={inputClass}
          />
          <input
            name="latitude"
            ref={latRef}
            defaultValue={seller.latitude ?? ""}
            placeholder="Latitude"
            aria-label="Latitude"
            className={inputClass}
          />
          <input
            name="longitude"
            ref={lngRef}
            defaultValue={seller.longitude ?? ""}
            placeholder="Longitude"
            aria-label="Longitude"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="offersPickup"
            defaultChecked={seller.offersPickup}
            className="size-4 accent-brand"
          />
          Permite retirada na loja física
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Salvar localização
          </Button>
          {state.error ? (
            <span className="text-xs text-destructive">{state.error}</span>
          ) : null}
          {state.ok ? (
            <span className="text-xs text-emerald-700">Salvo!</span>
          ) : null}
        </div>
      </form>
    </details>
  );
}
