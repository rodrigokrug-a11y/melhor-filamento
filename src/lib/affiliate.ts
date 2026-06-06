/**
 * Reescrita de links de saída para AFILIADOS.
 *
 * Toda saída passa por /go/[offerId] → applyAffiliate() é chamado no link final.
 * Para monetizar uma loja, adicione o domínio dela aqui e como aplicar a tag/
 * parâmetro de afiliado (conforme você entra nos programas: Awin, Lomadee,
 * Amazon Associados, ou o programa próprio da loja).
 *
 * Domínio NÃO cadastrado = link segue sem alteração (zero risco, nada quebra).
 * Casa por domínio-base, então "loja.exemplo.com.br" também casa "exemplo.com.br".
 */
type Rewriter = (url: URL) => void;

const AFFILIATE: Record<string, Rewriter> = {
  // Preencha conforme entrar nos programas. Exemplos (deixe comentado até ter a tag real):
  // "amazon.com.br": (u) => u.searchParams.set("tag", "SEU-TAG-20"),
  // "3dfila.com.br": (u) => u.searchParams.set("ref", "melhorfilamento"),
  // "voolt3d.com.br": (u) => u.searchParams.set("utm_affiliate", "SEU-ID"),
};

function baseDomain(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Aplica a regra de afiliado in-place se houver uma para o domínio da URL.
 * Retorna a mesma URL (alterada ou não). Nunca lança.
 */
export function applyAffiliate(url: URL): URL {
  const host = baseDomain(url.hostname);
  const rule =
    AFFILIATE[host] ??
    Object.entries(AFFILIATE).find(([d]) => host === d || host.endsWith("." + d))?.[1];
  try {
    rule?.(url);
  } catch {
    // Regra de afiliado inválida não pode impedir o redirecionamento.
  }
  return url;
}
