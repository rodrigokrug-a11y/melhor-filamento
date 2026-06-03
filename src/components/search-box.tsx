"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function SearchBox({
  defaultValue = "",
  size = "sm",
  className,
  placeholder = "Buscar filamento, marca, cor…",
  autoFocus = false,
}: {
  defaultValue?: string;
  size?: "sm" | "lg";
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term.length < 2) return;
    router.push(`/busca?q=${encodeURIComponent(term)}`);
  }

  if (size === "lg") {
    return (
      <form
        onSubmit={submit}
        className={cn(
          "flex items-center gap-2 rounded-full border-[1.5px] border-input bg-card py-1.5 pl-5 pr-1.5 shadow-md transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15",
          className,
        )}
      >
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar no catálogo"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="grad-brand inline-flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(14,126,123,0.5)] transition-transform hover:-translate-y-px active:translate-y-0"
        >
          Buscar
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-2 transition-colors focus-within:border-brand focus-within:bg-card",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar no catálogo"
        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
