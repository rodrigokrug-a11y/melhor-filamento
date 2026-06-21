/**
 * Reescrita de links de saída para AFILIADOS.
 *
 * Toda saída passa por /go/[offerId] → applyAffiliate() é chamado no link final.
 * Duas formas de monetizar uma loja:
 *  1. Config por loja no admin (campos `affiliateParams` / `affiliateTemplate`
 *     em Seller) — preferido, dá pra cadastrar sem deploy.
 *  2. Regra global por domínio aqui no código (ex.: Amazon/Mercado Livre, onde
 *     a tag é a mesma independente da loja).
 *
 * Sem config = link segue sem alteração (zero risco, nada quebra).
 */
export type SellerAffiliate = {
  affiliateParams?: string | null;
  affiliateTemplate?: string | null;
};

type Rewriter = (url: URL) => void;

// Regras globais por domínio (preencha conforme entrar nos programas de rede).
const AFFILIATE: Record<string, Rewriter> = {
  // "amazon.com.br": (u) => u.searchParams.set("tag", "SEU-TAG-20"),
  // "mercadolivre.com.br": (u) => u.searchParams.set("matt_tool", "SEU-ID"),
};

function baseDomain(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Aplica a regra de afiliado. Config por loja tem prioridade; sem ela, cai na
 * regra global por domínio. Retorna a URL final (pode ser uma nova URL quando
 * a loja usa rede de afiliado com template). Nunca lança.
 */
export function applyAffiliate(url: URL, seller?: SellerAffiliate | null): URL {
  // 1) Parâmetros de afiliado da loja (ex.: "ref=melhorfilamento&aff=ABC").
  if (seller?.affiliateParams) {
    try {
      new URLSearchParams(seller.affiliateParams).forEach((v, k) => {
        if (k) url.searchParams.set(k, v);
      });
    } catch {
      // params malformados não impedem o redirecionamento.
    }
  }

  // 2) Template de rede de afiliado (embrulha o link, ex.: Awin/Lomadee).
  if (seller?.affiliateTemplate && seller.affiliateTemplate.includes("{target}")) {
    try {
      return new URL(
        seller.affiliateTemplate.replace(
          "{target}",
          encodeURIComponent(url.toString()),
        ),
      );
    } catch {
      // template inválido → segue com a URL (já com os params aplicados).
    }
  }

  // 3) Sem config por loja → regra global por domínio.
  if (!seller?.affiliateParams && !seller?.affiliateTemplate) {
    const host = baseDomain(url.hostname);
    const rule =
      AFFILIATE[host] ??
      Object.entries(AFFILIATE).find(
        ([d]) => host === d || host.endsWith("." + d),
      )?.[1];
    try {
      rule?.(url);
    } catch {
      // regra inválida não pode impedir o redirecionamento.
    }
  }

  return url;
}
