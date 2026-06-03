import Image from "next/image";
import { type BannerPlacement } from "@prisma/client";
import { ArrowRight, Megaphone } from "lucide-react";

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

  // Botão CTA só quando há link de destino (senão não há para onde ir).
  const cta = b.linkUrl ? (b.ctaLabel?.trim() || "Saiba mais") : null;

  const inner = (
    <div className="grad-brand relative overflow-hidden rounded-2xl border text-white">
      {b.imageUrl ? (
        <Image
          src={b.imageUrl.startsWith("/") ? b.imageUrl : proxied(b.imageUrl)}
          alt={b.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 1100px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : null}
      {/* Escurece só a esquerda: texto legível, a imagem à direita fica visível. */}
      {b.imageUrl ? (
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />
      ) : null}
      <div
        className={`relative flex min-h-[170px] flex-col justify-center gap-2 p-6 ${
          b.imageUrl ? "max-w-[62%] sm:max-w-[55%]" : "max-w-2xl"
        }`}
      >
        <Badge
          variant="secondary"
          className="w-fit gap-1 bg-white/85 text-foreground"
        >
          <Megaphone className="size-3" />
          Anúncio
        </Badge>
        <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">
          {b.title}
        </h3>
        {b.subtitle ? (
          <p className="text-sm text-white/90">{b.subtitle}</p>
        ) : null}
        {cta ? (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand shadow-sm transition-colors group-hover:bg-white/90">
            {cta}
            <ArrowRight className="size-4" />
          </span>
        ) : null}
      </div>
    </div>
  );

  // Sem link de destino → banner apenas exibido (clicar não faz nada).
  if (!b.linkUrl) {
    return <div className="mb-6">{inner}</div>;
  }

  return (
    <a
      href={b.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group mb-6 block"
    >
      {inner}
    </a>
  );
}
