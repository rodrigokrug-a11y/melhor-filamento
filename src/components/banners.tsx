import Image from "next/image";
import { type BannerPlacement } from "@prisma/client";
import { ArrowRight, Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { type ActiveBanner, getPageBanner } from "@/lib/banners";

function proxied(url: string) {
  return `/api/img?url=${encodeURIComponent(url)}`;
}

/**
 * Anúncio do "display" do hero (home): imagem que preenche a área visual,
 * com selo "Anúncio" e clique direto para o anunciante (nova aba). Sem
 * link, apenas exibe. O admin escolhe via posição HERO em /admin/monetizacao.
 * Tamanho ideal da imagem: ~800×600 (proporção 4:3).
 */
export function HeroAd({ banner }: { banner: ActiveBanner }) {
  const img = banner.imageUrl
    ? banner.imageUrl.startsWith("/")
      ? banner.imageUrl
      : proxied(banner.imageUrl)
    : null;

  const inner = (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border bg-card shadow-lg">
      {img ? (
        <Image
          src={img}
          alt={banner.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grad-mesh absolute inset-0" />
      )}
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
        <Megaphone className="size-3" />
        Anúncio
      </span>
    </div>
  );

  if (!banner.linkUrl) {
    return <div className="aspect-[4/3]">{inner}</div>;
  }
  return (
    <a
      href={banner.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block aspect-[4/3]"
    >
      {inner}
    </a>
  );
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
