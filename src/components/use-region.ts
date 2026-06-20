"use client";

import { useSyncExternalStore } from "react";

import { CEP_ENABLED, type RegionData } from "@/lib/region";
import {
  clearRegionData,
  getServerSnapshot,
  getSnapshot,
  setRegionData,
  subscribe,
} from "@/lib/region-store";

export function useRegion(): {
  region: RegionData | null;
  setRegion: (data: RegionData) => void;
  clear: () => void;
} {
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  // Com o esquema de CEP/frete desligado, força "sem região" → tudo cai para
  // ranking/exibição por preço, mesmo que exista um cookie antigo.
  const region = CEP_ENABLED ? stored : null;
  return { region, setRegion: setRegionData, clear: clearRegionData };
}
