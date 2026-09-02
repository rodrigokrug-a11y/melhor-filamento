import { cache } from "react";

import type { AiToolName } from "@/lib/ai-usage";
import { prisma } from "@/lib/db";

/**
 * Preço por milhão de tokens do modelo usado nas ferramentas de IA.
 *
 * O padrão é o do Claude Haiku 4.5 (US$ 1,00 entrada / US$ 5,00 saída),
 * conferido em setembro de 2026. Se ANTHROPIC_MODEL apontar para outro modelo,
 * defina AI_PRICE_INPUT_PER_MTOK e AI_PRICE_OUTPUT_PER_MTOK no .env — senão o
 * custo exibido fica errado sem avisar.
 */
export const PRICE_INPUT_PER_MTOK = Number(
  process.env.AI_PRICE_INPUT_PER_MTOK ?? 1,
);
export const PRICE_OUTPUT_PER_MTOK = Number(
  process.env.AI_PRICE_OUTPUT_PER_MTOK ?? 5,
);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Custo em dólares de um volume de tokens. */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * PRICE_INPUT_PER_MTOK +
    (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_MTOK
  );
}

export type DayPoint = { date: string; calls: number };

/**
 * Série diária contínua: dia sem uso vira zero, não sai da série.
 *
 * Sem isso o gráfico "pula" os dias parados e some com a informação mais
 * importante de um painel de adoção — que houve dias sem ninguém usando.
 */
export function fillDays(
  rows: { date: string; calls: number }[],
  startDayMs: number,
  dayCount: number,
): DayPoint[] {
  const byDate = new Map(rows.map((r) => [r.date, r.calls]));
  const out: DayPoint[] = [];
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(startDayMs + i * DAY_MS).toISOString().slice(0, 10);
    out.push({ date, calls: byDate.get(date) ?? 0 });
  }
  return out;
}

export type ToolRow = {
  tool: AiToolName;
  calls: number;
  failed: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
};

export type AiStats = {
  periodDays: number;
  totalCalls: number;
  failedCalls: number;
  uniqueUsers: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  avgLatencyMs: number;
  byTool: ToolRow[];
  byDay: DayPoint[];
  topUsers: { id: string; name: string; calls: number; cost: number }[];
};

/** Estatísticas de uso das ferramentas de IA nos últimos `days` dias. */
export const getAiStats = cache(async (days = 30): Promise<AiStats> => {
  const startDayMs = new Date(Date.now() - (days - 1) * DAY_MS).setUTCHours(
    0,
    0,
    0,
    0,
  );
  const since = new Date(startDayMs);

  const [byToolRaw, totals, distinctUsers, byDayRaw, topUsersRaw] =
    await Promise.all([
      prisma.aiUsage.groupBy({
        by: ["tool"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        _sum: { inputTokens: true, outputTokens: true },
      }),
      prisma.aiUsage.aggregate({
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        _sum: { inputTokens: true, outputTokens: true },
        _avg: { latencyMs: true },
      }),
      prisma.aiUsage.findMany({
        where: { createdAt: { gte: since }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      // Agrupamento por dia precisa de SQL: o Prisma não trunca data no groupBy.
      prisma.$queryRaw<{ date: string; calls: bigint }[]>`
        SELECT to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
               count(*) AS calls
        FROM "AiUsage"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.aiUsage.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: since }, userId: { not: null } },
        _count: { _all: true },
        _sum: { inputTokens: true, outputTokens: true },
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),
    ]);

  const failedByTool = await prisma.aiUsage.groupBy({
    by: ["tool"],
    where: { createdAt: { gte: since }, ok: false },
    _count: { _all: true },
  });
  const failedMap = new Map(
    failedByTool.map((f) => [f.tool, f._count._all] as const),
  );

  const byTool: ToolRow[] = byToolRaw.map((t) => {
    const inputTokens = t._sum.inputTokens ?? 0;
    const outputTokens = t._sum.outputTokens ?? 0;
    return {
      tool: t.tool as AiToolName,
      calls: t._count._all,
      failed: failedMap.get(t.tool) ?? 0,
      inputTokens,
      outputTokens,
      cost: estimateCost(inputTokens, outputTokens),
    };
  });

  // Nomes dos usuários mais ativos, numa consulta só.
  const ids = topUsersRaw.map((u) => u.userId).filter((v): v is string => !!v);
  const users = ids.length
    ? await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  const inputTokens = totals._sum.inputTokens ?? 0;
  const outputTokens = totals._sum.outputTokens ?? 0;

  return {
    periodDays: days,
    totalCalls: totals._count._all,
    failedCalls: [...failedMap.values()].reduce((a, b) => a + b, 0),
    uniqueUsers: distinctUsers.length,
    inputTokens,
    outputTokens,
    cost: estimateCost(inputTokens, outputTokens),
    avgLatencyMs: Math.round(totals._avg.latencyMs ?? 0),
    byTool: byTool.sort((a, b) => b.calls - a.calls),
    byDay: fillDays(
      byDayRaw.map((r) => ({ date: r.date, calls: Number(r.calls) })),
      startDayMs,
      days,
    ),
    topUsers: topUsersRaw.map((u) => {
      const info = u.userId ? userById.get(u.userId) : null;
      return {
        id: u.userId ?? "—",
        name: info?.name || info?.email || "conta removida",
        calls: u._count._all,
        cost: estimateCost(
          u._sum.inputTokens ?? 0,
          u._sum.outputTokens ?? 0,
        ),
      };
    }),
  };
});
