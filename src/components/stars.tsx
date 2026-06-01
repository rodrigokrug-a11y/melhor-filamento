import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={
            n <= rounded
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}
