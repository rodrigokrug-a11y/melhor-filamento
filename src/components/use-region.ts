"use client";

import { useSyncExternalStore } from "react";

import type { RegionData } from "@/lib/region";
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
  const region = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { region, setRegion: setRegionData, clear: clearRegionData };
}
