import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import { getBrandsOverview, getCatalog } from "@/lib/catalog";
import { type BrandSummary } from "@/lib/catalog-types";
import { buildPool, type HomePools, POOL_FILAMENTS, POOL_RESINS } from "@/lib/home-deals";
import { getRanking, type RankingItem } from "@/lib/reviews";
import { getMaterialsOverview } from "@/lib/tips";

/**
 * Dados da home.
 *
 * Os anúncios são sorteados a cada acesso, então a home renderiza por
 * requisição (sem ISR). Para o banco não sentir isso, as consultas ficam num
 * cache com o mesmo TTL que o ISR tinha: o sorteio é por acesso, a consulta é
 * a cada 5 min.
 */
const HOME_TTL = 300;

/** Tag do cache — permite invalidar na mão com revalidateTag(). */
export const HOME_DATA_TAG = "home-data";

export type HomeData = HomePools & {
  brands: BrandSummary[];
  ranking: RankingItem[];
  materials: { material: string; tipCount: number }[];
};

async function loadHomeData(): Promise<HomeData> {
  const [filamentos, resinas, brands, ranking, materials] = await Promise.all([
    getCatalog("FILAMENT", { sort: "preco-asc" }),
    getCatalog("RESIN", { sort: "preco-asc" }),
    getBrandsOverview(),
    getRanking(),
    getMaterialsOverview(),
  ]);
  return {
    filamentPool: buildPool(filamentos.products, POOL_FILAMENTS),
    resinPool: buildPool(resinas.products, POOL_RESINS),
    brands: brands.filter((b) => b.productCount > 0).slice(0, 8),
    ranking: ranking.slice(0, 3),
    materials: materials.slice(0, 6),
  };
}

export const getHomeData = unstable_cache(loadHomeData, ["home-data"], {
  revalidate: HOME_TTL,
  tags: [HOME_DATA_TAG],
});

/**
 * Invalida a home depois de uma mudança no admin. A página é dinâmica, então
 * o que precisa cair é o cache de dados — o revalidatePath fica para o caso
 * de a home voltar a ser estática.
 */
export function revalidateHome(): void {
  revalidatePath("/");
  // "max": marca como obsoleto e revalida em background no próximo acesso.
  revalidateTag(HOME_DATA_TAG, "max");
}
