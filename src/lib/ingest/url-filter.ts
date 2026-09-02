/**
 * Filtro de URL de produto usado ao varrer o sitemap de uma fonte.
 *
 * Cada loja monta a URL de produto do seu jeito — /produto/, /p/, -p-, /loja/ —
 * e o filtro embutido só cobria três formatos. Fonte cuja URL não batia varria
 * o sitemap inteiro e voltava com zero produtos, sem erro nenhum: exatamente
 * como uma fonte morta se disfarça de "ok".
 *
 * O filtro é uma LISTA DE TRECHOS, não uma expressão regular. Isso é
 * deliberado: quem cadastra a fonte é um humano no admin, e um trecho como
 * "/produto/" é escrito sem erro por qualquer pessoa. Regex, além de exigir
 * sintaxe, deixaria um caminho aberto para uma expressão patológica travar a
 * ingestão inteira contra centenas de URLs.
 */

/** Trechos usados quando a fonte não define os seus. */
export const DEFAULT_URL_FILTER = ["produto", "product", "prod-"];

/** Tamanho máximo do campo, para o formulário e a validação concordarem. */
export const URL_FILTER_MAX_LENGTH = 200;

/**
 * Lê o campo do banco (trechos separados por vírgula) numa lista.
 *
 * Vazio, só espaços ou null significam "use o padrão" — nunca "não filtre
 * nada". Uma fonte sem filtro puxaria a loja inteira, categorias e blog junto.
 */
export function parseUrlFilter(raw: string | null | undefined): string[] {
  const parts = (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return parts.length > 0 ? parts : DEFAULT_URL_FILTER;
}

/** A URL contém algum dos trechos? Comparação simples, sem caixa. */
export function matchesUrlFilter(url: string, fragments: string[]): boolean {
  const lower = url.toLowerCase();
  return fragments.some((f) => lower.includes(f));
}

/** Predicado pronto para `discoverUrls`. */
export function urlFilterPredicate(
  raw: string | null | undefined,
): (url: string) => boolean {
  const fragments = parseUrlFilter(raw);
  return (url) => matchesUrlFilter(url, fragments);
}

/**
 * Valida o que o admin digitou. Devolve o valor a guardar (null = padrão) ou
 * uma mensagem de erro.
 */
export function validateUrlFilter(
  raw: string | null | undefined,
): { value: string | null } | { error: string } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { value: null };
  if (trimmed.length > URL_FILTER_MAX_LENGTH) {
    return { error: `Use no máximo ${URL_FILTER_MAX_LENGTH} caracteres.` };
  }
  const parts = parseUrlFilter(trimmed);
  // Um trecho de uma letra casa com quase toda URL e traz o site inteiro —
  // o oposto do que o campo serve para fazer.
  const curto = parts.find((p) => p.length < 2);
  if (curto) {
    return { error: `"${curto}" é curto demais — use ao menos 2 caracteres.` };
  }
  return { value: parts.join(", ") };
}
