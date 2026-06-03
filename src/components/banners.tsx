import Image from "next/image";
import { type BannerPlacement } from "@prisma/client";
import { Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getPageBanner } from "@/lib/banners";

function proxied(url: string) {
  return `/api/img?url=${encodeURIComponent(url)}`;
}

/**
 * Banner da página, exibido acima do título (a primeira coisa do conteúdo).
 * Mostra o banner próprio da posição ou o GLOBAL como fallback. Sem banner
 * ativo, não renderiza nada.
 */
export async function PageBanner({
  placement,
}: {
  placement: BannerPlacement;
}) {
  const b = await getPageBanner(placement);
  if (!b) return null;
  return (
    <a
      href={b.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group mb-6 block"
    >
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand to-teal text-white">
        {b.imageUrl ? (
          <Image
            src={proxied(b.imageUrl)}
            alt={b.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <div
          className={`relative flex min-h-[140px] flex-col justify-center gap-1.5 p-6 ${
            b.imageUrl ? "bg-black/35" : ""
          }`}
        >
          <Badge
            variant="secondary"
            className="w-fit gap-1 bg-white/85 text-foreground"
          >
            <Megaphone className="size-3" />
            Anúncio
          </Badge>
          <h3 className="font-display text-xl font-bold sm:text-2xl">
            {b.title}
          </h3>
          {b.subtitle ? (
            <p className="max-w-2xl text-sm text-white/90">{b.subtitle}</p>
          ) : null}
        </div>
      </div>
    </a>
  );
}
