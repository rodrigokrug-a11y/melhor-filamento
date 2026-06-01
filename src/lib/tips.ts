import { cache } from "react";
import { type Material } from "@prisma/client";

import { FILAMENT_MATERIALS } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";

export const getTipsByMaterial = cache(async (material: string) => {
  return prisma.tip.findMany({
    where: { material: material as Material, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
  });
});

export const getMaterialsOverview = cache(async () => {
  const groups = await prisma.tip.groupBy({
    by: ["material"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });
  return FILAMENT_MATERIALS.map((m) => ({
    material: m as string,
    tipCount: groups.find((g) => g.material === m)?._count._all ?? 0,
  }));
});

export const getPendingTips = cache(async () => {
  return prisma.tip.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { product: { select: { name: true } } },
  });
});
