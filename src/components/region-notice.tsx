"use client";

import { MapPin } from "lucide-react";

import { useRegion } from "@/components/use-region";
import { CEP_ENABLED } from "@/lib/region";
import { REGION_LABELS } from "@/lib/shipping";

export function RegionNotice() {
  const { region } = useRegion();

  // Esquema de CEP/frete desligado: nada de aviso de frete.
  if (!CEP_ENABLED) return null;

  const place =
    region &&
    (region.localidade
      ? `${region.localidade} · ${region.uf}`
      : `${REGION_LABELS[region.region]} · ${region.uf}`);

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <MapPin className="size-3.5 shrink-0" />
      {place
        ? `Frete e total estimados para ${place}.`
        : "Informe seu CEP no topo para ver o frete e o total por oferta."}
    </p>
  );
}
