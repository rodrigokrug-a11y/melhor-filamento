"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Imagem de produto resiliente: tenta a URL direta da loja; se falhar (ex.:
 * hotlink protection), tenta pelo proxy /api/img; se ainda falhar, mostra o
 * fallback (ícone). Carregar direto primeiro evita sobrecarregar o proxy com
 * imagens que já funcionam.
 */
export function ProductImage({
  src,
  alt,
  fallback,
  sizes,
  className,
}: {
  src: string | null;
  alt: string;
  fallback: React.ReactNode;
  sizes?: string;
  className?: string;
}) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  if (!src || stage === 2) return <>{fallback}</>;

  const url = stage === 0 ? src : `/api/img?url=${encodeURIComponent(src)}`;
  return (
    <Image
      key={url}
      src={url}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      onError={() => setStage((s) => (s === 0 ? 1 : 2))}
      className={className}
    />
  );
}
