// Dados visuais dos guias (categoria + frase de destaque), usados pelas rotas
// de imagem (opengraph-image e imagem/route). Client-safe: só dados.

export type GuiaCat = { label: string; accent: string };

const IMPRESSORAS: GuiaCat = { label: "Impressoras", accent: "#5FB3AF" };
const FILAMENTOS: GuiaCat = { label: "Filamentos", accent: "#9BE06A" };
const RESINA: GuiaCat = { label: "Resina", accent: "#E0A92E" };
const CUSTO: GuiaCat = { label: "Custo", accent: "#9BE06A" };
const CUIDADOS: GuiaCat = { label: "Cuidados", accent: "#5FB3AF" };

const CAT_BY_SLUG: Record<string, GuiaCat> = {
  "tipos-de-filamento": FILAMENTOS,
  "guia-de-compra-impressora-3d": IMPRESSORAS,
  "impressora-3d-resina-ou-filamento": IMPRESSORAS,
  "melhor-impressora-3d-custo-beneficio": IMPRESSORAS,
  "vale-a-pena-comprar-impressora-3d": IMPRESSORAS,
  "bambu-lab-vs-creality-vs-elegoo": IMPRESSORAS,
  "melhor-impressora-3d-resina-custo-beneficio": IMPRESSORAS,
  "pla-vs-petg-vs-abs": FILAMENTOS,
  "melhor-marca-filamento-pla": FILAMENTOS,
  "melhor-filamento-por-projeto": FILAMENTOS,
  "melhor-filamento-area-externa": FILAMENTOS,
  "filamento-tpu-flexivel": FILAMENTOS,
  "qual-resina-3d-comprar": RESINA,
  "quanto-custa-imprimir-em-3d": CUSTO,
  "como-secar-filamento": CUIDADOS,
  "peca-descola-da-mesa-warping": CUIDADOS,
  "erros-comuns-impressao-3d-fdm": CUIDADOS,
  "quanto-custa-filamento-pla-no-brasil": CUSTO,
  "onde-comprar-filamento-3d-barato": CUSTO,
  "melhor-filamento-para-ender-3": FILAMENTOS,
};

export function guiaCat(slug: string): GuiaCat {
  return CAT_BY_SLUG[slug] ?? FILAMENTOS;
}

// Frase-destaque (curta) do banner no meio do artigo.
const DESTAQUE_BY_SLUG: Record<string, string> = {
  "tipos-de-filamento": "O material certo muda tudo",
  "guia-de-compra-impressora-3d": "Primeiro a tecnologia, depois o preço",
  "impressora-3d-resina-ou-filamento": "Detalhe fino ou peça funcional?",
  "melhor-impressora-3d-custo-beneficio": "Custo-benefício é sobre o seu uso",
  "vale-a-pena-comprar-impressora-3d": "Faça as contas antes de comprar",
  "bambu-lab-vs-creality-vs-elegoo": "A marca é o ecossistema inteiro",
  "pla-vs-petg-vs-abs": "Cada filamento para cada projeto",
  "melhor-marca-filamento-pla": "Compare por preço/kg, não pelo rolo",
  "melhor-filamento-por-projeto": "O filamento certo para a sua peça",
  "melhor-filamento-area-externa": "Sol e chuva pedem o material certo",
  "filamento-tpu-flexivel": "Flexível pede impressora preparada",
  "qual-resina-3d-comprar": "A resina certa para cada aplicação",
  "quanto-custa-imprimir-em-3d": "O preço do rolo engana — pense por kg",
  "como-secar-filamento": "Filamento úmido arruína a impressão",
  "peca-descola-da-mesa-warping": "A primeira camada decide tudo",
  "erros-comuns-impressao-3d-fdm": "Todo erro tem causa e solução",
  "quanto-custa-filamento-pla-no-brasil": "Compare por preço/kg e some o frete",
  "onde-comprar-filamento-3d-barato": "O barato de verdade é o custo total",
  "melhor-filamento-para-ender-3": "Comece no PLA, evolua depois",
};

export function guiaDestaque(slug: string): string {
  return DESTAQUE_BY_SLUG[slug] ?? "Compare. Descubra. Compre melhor.";
}
