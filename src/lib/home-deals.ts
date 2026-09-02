import { type ProductListItem } from "@/lib/catalog-types";

/**
 * Sorteio dos anúncios da home.
 *
 * A home mostrava sempre os mesmos produtos (os N primeiros do catálogo
 * ordenado por preço). Aqui o critério continua sendo "os mais baratos", mas
 * de um pool maior sai uma combinação diferente a cada acesso.
 *
 * Lógica pura, sem banco — é o que o teste exercita.
 */

/**
 * Tamanho do pool sorteável. A home mostra ~13 filamentos e ~9 resinas por
 * acesso; um pool maior dá variedade sem sair da faixa dos mais baratos.
 */
export const POOL_FILAMENTS = 28;
export const POOL_RESINS = 18;

/** Quantos patrocinados/fixados furam a fila do sorteio, por categoria. */
const PROMOTED_SLOTS = 2;

const SHOWCASE_FILAMENTS = 5;
const SHOWCASE_RESINS = 3;
const HERO_FILAMENTS = 4;
const HERO_RESINS = 2;
const HERO_MIN = 3;
const RAIL_SIZE = 4;

export type HomePools = {
  filamentPool: ProductListItem[];
  resinPool: ProductListItem[];
};

export type HomeDeals = {
  /** Carrossel do hero. */
  hero: ProductListItem[];
  /** Vitrine "Ofertas de agora", já em ordem de preço. */
  showcase: ProductListItem[];
  moreFilaments: ProductListItem[];
  moreResins: ProductListItem[];
};

/** Produto com destaque pago (leilão) ou fixado à mão pelo admin. */
function isPromoted(p: ProductListItem): boolean {
  return p.boost != null || p.sortOrder > 0;
}

/**
 * Os `size` mais baratos da categoria — mais os patrocinados, que entram no
 * pool mesmo fora dessa faixa (é o que o anunciante paga).
 */
export function buildPool(products: ProductListItem[], size: number): ProductListItem[] {
  const byPrice = [...products].sort((a, b) => a.bestPrice - b.bestPrice);
  const promoted = byPrice.filter(isPromoted);
  const cheapest = byPrice.filter((p) => !isPromoted(p)).slice(0, size);
  return [...promoted, ...cheapest];
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Embaralha o pool deixando os patrocinados na frente da fila. */
function shuffleForDraw(pool: ProductListItem[]): ProductListItem[] {
  const shuffled = shuffle(pool);
  const promoted = shuffled.filter(isPromoted).slice(0, PROMOTED_SLOTS);
  const ids = new Set(promoted.map((p) => p.id));
  return [...promoted, ...shuffled.filter((p) => !ids.has(p.id))];
}

/**
 * Sorteia os anúncios da home a partir do pool dos mais baratos. Cada acesso
 * vê uma combinação diferente e nenhum produto se repete entre as seções.
 */
export function drawHomeDeals({ filamentPool, resinPool }: HomePools): HomeDeals {
  const filaments = shuffleForDraw(filamentPool);
  const resins = shuffleForDraw(resinPool);

  const showcase = [
    ...filaments.splice(0, SHOWCASE_FILAMENTS),
    ...resins.splice(0, SHOWCASE_RESINS),
  ].sort((a, b) => a.bestPrice - b.bestPrice);

  const hero = [...filaments.splice(0, HERO_FILAMENTS), ...resins.splice(0, HERO_RESINS)];
  // Catálogo pequeno: em vez de um hero quase vazio, repete o que a vitrine
  // já mostrou (é um carrossel — repetir ali não incomoda).
  if (hero.length < HERO_MIN) {
    const ids = new Set(hero.map((p) => p.id));
    hero.push(...showcase.filter((p) => !ids.has(p.id)).slice(0, HERO_MIN));
  }

  return {
    hero,
    showcase,
    moreFilaments: filaments.splice(0, RAIL_SIZE),
    moreResins: resins.splice(0, RAIL_SIZE),
  };
}
