import { cache } from "react";

import { prisma } from "@/lib/db";

export type ActiveBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string;
};

/** Banner ativo de maior lance para a posição (home grande / faixa global). */
export const getActiveBanner = cache(
  async (placement: "HOME" | "GLOBAL"): Promise<ActiveBanner | null> => {
    return prisma.banner.findFirst({
      where: { placement, status: "ACTIVE" },
      orderBy: { bidAmount: "desc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
      },
    });
  },
);
