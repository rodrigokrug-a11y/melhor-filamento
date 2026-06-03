"use client";

import { useSyncExternalStore } from "react";

// Seleção de produtos para comparar (localStorage). A comparação é por tipo:
// adicionar um produto de outro tipo recomeça a lista.

export type CompareKind = "FILAMENT" | "RESIN" | "PRINTER";
export type CompareState = { kind: CompareKind | null; slugs: string[] };

export const COMPARE_MAX = 4;
const KEY = "mf_comparar";
const EMPTY: CompareState = { kind: null, slugs: [] };
const listeners = new Set<() => void>();

let cacheStr = "";
let cache: CompareState = EMPTY;

function readRaw(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}

function getSnapshot(): CompareState {
  const raw = readRaw();
  if (raw !== cacheStr) {
    cacheStr = raw;
    try {
      const p = JSON.parse(raw || "null");
      cache =
        p && Array.isArray(p.slugs)
          ? { kind: p.kind ?? null, slugs: p.slugs as string[] }
          : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function getServerSnapshot(): CompareState {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function write(state: CompareState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function toggleCompare(slug: string, kind: CompareKind) {
  const cur = getSnapshot();
  if (cur.kind !== kind) {
    write({ kind, slugs: [slug] });
    return;
  }
  if (cur.slugs.includes(slug)) {
    const slugs = cur.slugs.filter((s) => s !== slug);
    write({ kind: slugs.length ? kind : null, slugs });
  } else {
    if (cur.slugs.length >= COMPARE_MAX) return;
    write({ kind, slugs: [...cur.slugs, slug] });
  }
}

export function clearCompare() {
  write(EMPTY);
}

export function useCompare(): CompareState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
