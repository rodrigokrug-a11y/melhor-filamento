import { cache } from "react";
import { type BannerPlacement } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ActiveBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string;
  ctaLabel: string | null;
  productId: string | null;
};

/** Banner ativo de maior lance para a posição EXATA (ou null). */
export const getActiveBanner = cache(
  async (placement: BannerPlacement): Promise<ActiveBanner | null> => {
    return prisma.banner.findFirst({
      where: { placements: { has: placement }, status: "ACTIVE" },
      orderBy: { bidAmount: "desc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
        ctaLabel: true,
        productId: true,
      },
    });
  },
);

/**
 * Banner da página: usa o banner próprio da posição; se não houver, cai no
 * GLOBAL (mesmo banner em todas as páginas). Assim o admin define um por página
 * — diferente ou, via GLOBAL, igual em todas.
 */
export const getPageBanner = cache(
  async (placement: BannerPlacement): Promise<ActiveBanner | null> => {
    const own = await getActiveBanner(placement);
    if (own) return own;
    if (placement === "GLOBAL") return null;
    return getActiveBanner("GLOBAL");
  },
);
