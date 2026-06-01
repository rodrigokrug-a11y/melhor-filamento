"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function BrandLogo({
  name,
  logoUrl,
  size = 40,
  className,
}: {
  name: string;
  logoUrl: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
