"use client";

import { useSyncExternalStore } from "react";

// Favoritos do usuário guardados no localStorage (sem login). Compartilhado
// entre todos os componentes via useSyncExternalStore.

const KEY = "mf_favoritos";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();

let cacheStr = "";
let cache: string[] = EMPTY;

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(KEY) ?? "[]";
}

function getSnapshot(): string[] {
  const raw = readRaw();
  if (raw !== cacheStr) {
    cacheStr = raw;
    try {
      const parsed = JSON.parse(raw);
      cache = Array.isArray(parsed) ? (parsed as string[]) : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function getServerSnapshot(): string[] {
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

function emit() {
  listeners.forEach((l) => l());
}

export function toggleFavorite(slug: string) {
  const cur = getSnapshot();
  const next = cur.includes(slug)
    ? cur.filter((s) => s !== slug)
    : [...cur, slug];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
