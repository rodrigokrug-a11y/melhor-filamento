/**
 * Seleção da vitrine da home.
 *
 * Dois problemas que este módulo resolve:
 *
 * 1. **Ordenar por preço absoluto engana.** Um rolo de 250g a R$ 54,90 tem o
 *    menor número da lista, mas custa R$ 219,60/kg — muito pior que um de 1kg
 *    a R$ 89,90. Ranquear pelo preço cheio enche a vitrine de rolinhos caros
 *    e vende como "menor preço".
 *
 * 2. **Seleção fixa deixa a home congelada.** Pegando sempre os N primeiros,
 *    quem volta ao site vê exatamente a mesma coisa.
 */

import type { ProductListItem } from "@/lib/catalog-types";

/** Quantos cards a vitrine exibe. */
export const SHOWCASE_SIZE = 8;

/** De quantos candidatos a vitrine sorteia — maior que o exibido, para girar. */
export const SHOWCASE_POOL = 24;

/** De quanto em quanto tempo a vitrine gira. */
export const ROTATION_MS = 30 * 60 * 1000;

/**
 * Preço por quilo — a métrica que permite comparar rolos de tamanhos
 * diferentes. `null` quando o peso não é conhecido (impressoras, acessórios).
 */
export function pricePerKg(p: ProductListItem): number | null {
  if (!p.netWeightG || p.netWeightG <= 0) return null;
  return p.bestPrice / (p.netWeightG / 1000);
}

/**
 * Atratividade de uma oferta, do melhor para o pior:
 *
 * 1. desconto ativo (é o que faz de "oferta" uma oferta);
 * 2. menor preço por quilo;
 * 3. menor preço absoluto, para o que não tem peso conhecido.
 */
export function compareAttractiveness(
  a: ProductListItem,
  b: ProductListItem,
): number {
  if (a.discountPct !== b.discountPct) return b.discountPct - a.discountPct;

  const ka = pricePerKg(a);
  const kb = pricePerKg(b);
  if (ka != null && kb != null) {
    if (ka !== kb) return ka - kb;
  } else if (ka != null) {
    return -1; // com peso conhecido vem antes
  } else if (kb != null) {
    return 1;
  }

  if (a.bestPrice !== b.bestPrice) return a.bestPrice - b.bestPrice;
  // Desempate estável, para a ordem não variar entre renderizações.
  return a.id.localeCompare(b.id);
}

/**
 * Escolhe os produtos da vitrine: ordena por atratividade, separa os melhores
 * num conjunto maior que o exibido e percorre esse conjunto ao longo do dia.
 *
 * A rotação é derivada do relógio, não aleatória, para que duas renderizações
 * na mesma janela produzam a mesma vitrine — do contrário o cache da página
 * serviria conteúdos diferentes para visitantes simultâneos.
 */
export function pickShowcase(
  products: ProductListItem[],
  now: number = Date.now(),
  size: number = SHOWCASE_SIZE,
): ProductListItem[] {
  const ranked = [...products].sort(compareAttractiveness);
  const pool = ranked.slice(0, Math.max(size, SHOWCASE_POOL));
  if (pool.length <= size) return pool;

  const bucket = Math.floor(now / ROTATION_MS);
  const offset = ((bucket % pool.length) + pool.length) % pool.length;

  const out: ProductListItem[] = [];
  for (let i = 0; i < size; i++) out.push(pool[(offset + i) % pool.length]);
  return out;
}
