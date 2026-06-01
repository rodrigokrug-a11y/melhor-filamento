"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Loader2, LocateFixed, MapPin, Store } from "lucide-react";

import { geocodeUserCep } from "@/app/perto/actions";
import { useRegion } from "@/components/use-region";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NearbyStore } from "@/lib/catalog-types";
import { formatKm, haversineKm } from "@/lib/distance";
import { cn, formatBRL } from "@/lib/utils";

const StoreMap = dynamic(() => import("@/components/store-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-2xl bg-muted" />
  ),
});

type Coords = { lat: number; lng: number };

export function NearbyView({ stores }: { stores: NearbyStore[] }) {
  const { region } = useRegion();
  const [gpsUser, setGpsUser] = useState<Coords | null>(null);
  const [cepUser, setCepUser] = useState<Coords | null>(null);
  const [pickupOnly, setPickupOnly] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = gpsUser ?? cepUser;
  const source = gpsUser ? "gps" : cepUser ? "cep" : null;

  // Sem GPS: usa o CEP informado para estimar a localização (nível cidade).
  useEffect(() => {
    if (gpsUser || cepUser || !region?.cep) return;
    let cancelled = false;
    geocodeUserCep(region.cep).then((c) => {
      if (!cancelled && c) setCepUser({ lat: c.latitude, lng: c.longitude });
    });
    return () => {
      cancelled = true;
    };
  }, [region?.cep, gpsUser, cepUser]);

  function locate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocalização indisponível neste navegador.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Não foi possível obter sua localização.");
        setLocating(false);
      },
    );
  }

  const list = useMemo(() => {
    const uf = region?.uf ?? null;
    const withDist = stores.map((s) => ({
      ...s,
      distanceKm: user
        ? haversineKm(user.lat, user.lng, s.latitude, s.longitude)
        : null,
    }));
    const filtered = pickupOnly
      ? withDist.filter((s) => s.offersPickup)
      : withDist;
    filtered.sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      const aSame = uf && a.uf === uf ? 0 : 1;
      const bSame = uf && b.uf === uf ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return a.name.localeCompare(b.name, "pt-BR");
    });
    return filtered;
  }, [stores, user, pickupOnly, region]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <Button type="button" onClick={locate} disabled={locating}>
          {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          Usar minha localização
        </Button>
        <button
          type="button"
          onClick={() => setPickupOnly((v) => !v)}
          aria-pressed={pickupOnly}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            pickupOnly
              ? "border-primary bg-brand-soft text-brand"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          <Store className="size-3.5" />
          Só com retirada
        </button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {source === "cep" && region ? (
          <p className="text-xs text-muted-foreground">
            Distâncias a partir do seu CEP
            {region.localidade ? ` (${region.localidade}/${region.uf})` : ""}.
            Toque em “Usar minha localização” para mais precisão.
          </p>
        ) : !user && region?.uf ? (
          <p className="text-xs text-muted-foreground">
            Mostrando lojas de {region.uf} primeiro. Informe seu CEP no topo ou
            use sua localização para ordenar por distância.
          </p>
        ) : null}
      </div>

      <StoreMap stores={list} user={user} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-teal" /> retira na loja
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" /> entrega
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#2563eb]" /> você
        </span>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhuma loja com localização por aqui ainda.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-brand/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.offersPickup ? (
                      <Badge variant="teal">Retira na loja</Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {s.city ? `${s.city}/${s.uf}` : "Local não informado"}
                    {s.distanceKm != null
                      ? ` · ${formatKm(s.distanceKm)} de você`
                      : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {s.cheapestPrice != null ? (
                    <p className="font-display font-bold tnum">
                      {formatBRL(s.cheapestPrice)}
                    </p>
                  ) : null}
                  {s.offerCount > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {s.offerCount} {s.offerCount === 1 ? "oferta" : "ofertas"}
                    </p>
                  ) : null}
                </div>
              </div>
              {s.cheapestProduct ? (
                <Link
                  href={`/produto/${s.cheapestProduct.slug}`}
                  className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
                >
                  Ver oferta mais barata →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
