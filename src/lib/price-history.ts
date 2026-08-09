/**
 * Reconstrução da série diária de menor preço a partir de snapshots.
 *
 * Os snapshots registram apenas **mudanças** de preço, não uma leitura por
 * execução da ingestão. O histórico é, portanto, uma série de degraus: entre
 * duas mudanças o preço da oferta permanece o último valor conhecido, e é
 * isso que este módulo repete dia a dia.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Preço vigente de uma oferta no início da janela consultada. */
export type PriceBaseline = { offerId: string; price: number };

/** Mudança de preço observada dentro da janela. */
export type PriceChange = { offerId: string; price: number; at: Date };

export type DailyPrice = { date: string; price: number };

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function minOf(prices: Iterable<number>): number {
  let min = Infinity;
  for (const p of prices) if (p < min) min = p;
  return min;
}

/**
 * Monta `dayCount` dias a partir de `startDayMs` (inclusive), repetindo o
 * último preço conhecido de cada oferta nos dias sem mudança.
 *
 * O valor de cada dia é o **menor preço atingido naquele dia** entre todas as
 * ofertas — considerando tanto o estado no início do dia quanto cada mudança
 * ocorrida ao longo dele, para não perder uma queda que subiu de novo no
 * mesmo dia.
 *
 * Dias anteriores ao primeiro preço conhecido são omitidos (não havia preço
 * a exibir), e não uma lacuna no meio da série.
 */
export function buildDailyMinSeries(args: {
  baseline: PriceBaseline[];
  changes: PriceChange[];
  startDayMs: number;
  dayCount: number;
}): DailyPrice[] {
  const { baseline, changes, startDayMs, dayCount } = args;

  // Preço corrente de cada oferta, avançando no tempo.
  const current = new Map<string, number>();
  for (const b of baseline) current.set(b.offerId, b.price);

  const byDay = new Map<string, PriceChange[]>();
  for (const c of changes) {
    const key = dayKey(c.at.getTime());
    const list = byDay.get(key);
    if (list) list.push(c);
    else byDay.set(key, [c]);
  }
  // Dentro do dia, aplica na ordem cronológica.
  for (const list of byDay.values()) {
    list.sort((a, b) => a.at.getTime() - b.at.getTime());
  }

  const series: DailyPrice[] = [];
  for (let i = 0; i < dayCount; i++) {
    const key = dayKey(startDayMs + i * DAY_MS);

    let dayMin = minOf(current.values());
    for (const change of byDay.get(key) ?? []) {
      current.set(change.offerId, change.price);
      const after = minOf(current.values());
      if (after < dayMin) dayMin = after;
    }

    if (dayMin < Infinity) series.push({ date: key, price: dayMin });
  }

  return series;
}
