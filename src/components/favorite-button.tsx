"use client";

import { Heart } from "lucide-react";

import { toggleFavorite, useFavorites } from "@/lib/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  slug,
  className,
  size = "sm",
}: {
  slug: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const favs = useFavorites();
  const active = favs.includes(slug);

  return (
    <button
      type="button"
      aria-label={active ? "Remover dos favoritos" : "Salvar nos favoritos"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors hover:text-brand",
        size === "lg" ? "size-11" : "size-9",
        active ? "text-brand" : "text-muted-foreground",
        className,
      )}
    >
      <Heart
        className={cn(size === "lg" ? "size-5" : "size-4", active && "fill-current")}
      />
    </button>
  );
}
