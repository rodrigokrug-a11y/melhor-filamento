import Image from "next/image";
import { Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getActiveBanner } from "@/lib/banners";

function proxied(url: string) {
  return `/api/img?url=${encodeURIComponent(url)}`;
}

/** Banner grande da home — o de maior lance ativo. Renderiza nada se não houver. */
export async function HomeBanner() {
  const b = await getActiveBanner("HOME");
  if (!b) return null;
  return (
    <a
      href={b.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block"
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
          className={`relative flex min-h-[150px] flex-col justify-center gap-1.5 p-6 ${
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

/** Faixa fina em todas as páginas — o banner GLOBAL de maior lance ativo. */
export async function GlobalBanner() {
  const b = await getActiveBanner("GLOBAL");
  if (!b) return null;
  return (
    <a
      href={b.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block border-b bg-brand-soft/70 transition-colors hover:bg-brand-soft"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-1.5 text-sm">
        <Megaphone className="size-3.5 shrink-0 text-brand" />
        <span className="font-medium">{b.title}</span>
        {b.subtitle ? (
          <span className="truncate text-muted-foreground">— {b.subtitle}</span>
        ) : null}
        <span className="ml-auto shrink-0 text-xs font-medium text-teal">
          ver &rarr;
        </span>
      </div>
    </a>
  );
}
