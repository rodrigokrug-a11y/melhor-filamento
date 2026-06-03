"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useFavorites } from "@/lib/use-favorites";

export function FavoritesNavLink() {
  const favs = useFavorites();
  const n = favs.length;
  return (
    <Link
      href="/favoritos"
      aria-label={n ? `Favoritos (${n})` : "Favoritos"}
      className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Heart className="size-5" />
      {n > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-white">
          {n}
        </span>
      ) : null}
    </Link>
  );
}
