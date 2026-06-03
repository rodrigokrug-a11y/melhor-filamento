import { cache } from "react";
import { type Material } from "@prisma/client";

import { prisma } from "@/lib/db";

/** Receitas aprovadas (opcionalmente de um material). */
export const getRecipes = cache(async (material?: string) => {
  return prisma.recipe.findMany({
    where: {
      status: "APPROVED",
      ...(material ? { material: material as Material } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
});

/** Receitas aguardando moderação. */
export const getPendingRecipes = cache(async () => {
  return prisma.recipe.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
});

/** Contagem de receitas aprovadas por material (para os filtros). */
export const getRecipeMaterialCounts = cache(async () => {
  const groups = await prisma.recipe.groupBy({
    by: ["material"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });
  const m: Record<string, number> = {};
  for (const g of groups) m[g.material] = g._count._all;
  return m;
});
