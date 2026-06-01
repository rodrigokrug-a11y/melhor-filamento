# Briefing de Design — Melhor Filamento

> Cole tudo abaixo da linha como primeira mensagem para o Claude Design. É um briefing: explica **o que é o sistema**, para quem, como funciona e o que queremos do design.

---

Você é um(a) **designer de produto e marca**. Vou te explicar o **Melhor Filamento** para você **evoluir a identidade visual e o design das telas**. Leia o contexto inteiro antes de propor — quero que você entenda o sistema, não só "deixe bonito".

## 1. O que é o Melhor Filamento

É um **comparador de preços de filamentos e resinas para impressão 3D no Brasil**. O usuário informa o **CEP** e o site mostra, em um ranking, **onde comprar pelo menor custo total — preço + frete até o endereço dele**. Também mostra **lojas perto** para retirar pessoalmente, **histórico de preço** de cada produto, **avaliações** e **dicas de impressão**.

Em uma frase: **"O melhor custo em filamento e resina 3D, já com o frete pro seu CEP."**

## 2. O problema que resolvemos

Quem imprime em 3D no Brasil compra filamento e resina com frequência e:

- os preços mudam o tempo todo e estão espalhados em dezenas de lojas;
- o **frete varia muito por região** — uma oferta "barata" pode sair cara depois do frete;
- é difícil saber o **custo real até a sua casa** antes de ir loja por loja;
- falta transparência sobre confiabilidade da loja e sobre o histórico de preço.

O Melhor Filamento resolve isso num lugar só: **ranking por custo total para o seu CEP**, com sinais de confiança e lojas próximas.

## 3. Para quem é (público)

- **Hobbista maker** — imprime por hobby, sensível a preço, compara bastante.
- **Pequeno negócio / serviço de impressão** — compra recorrente, quer custo previsível e estoque.
- **Iniciante** — acabou de comprar a primeira impressora, está perdido entre materiais (PLA, PETG, ABS, TPU, resina…).

Perfil geral: **Brasil, português, mobile-first**, comunidade maker (curiosa, "mão na massa"), atenta a preço e frete. Boa parte acessa pelo **celular**.

## 4. Como funciona — jornada principal

1. Chega no site → **informa o CEP** (ou é detectado).
2. Vê o **ranking de ofertas por custo total** (preço + frete pro CEP dele).
3. **Filtra/compara** por material, marca, cor, diâmetro, preço.
4. Abre o **produto**: specs, ofertas de várias lojas com frete, histórico de preço, avaliações.
5. Clica em **"Ver oferta"** → deixa nome/e-mail (vira **lead**) → é levado à loja para concluir a compra.
6. Caminhos paralelos: **"perto de você"** (mapa, retirar na loja), **dicas** de impressão, **ranking** dos melhores.

## 5. Telas e o que cada uma precisa comunicar

- **Home** — proposta de valor, "informe seu CEP", como funciona, destaques, prévia do ranking e das dicas. Converter o visitante para a primeira comparação.
- **Filamentos / Resinas** (listagem) — grade de produtos + **filtros** (material, marca, cor, diâmetro, faixa de preço). Escanear muitas opções rápido.
- **Produto** — galeria, ficha técnica, **tabela de ofertas por loja com frete estimado e custo total**, selo de loja verificada, **gráfico de histórico de preço**, avaliações e dicas. É a tela de decisão.
- **Comparar** — comparação dinâmica com **filtros ao vivo** lado a lado.
- **Perto de você** — **mapa interativo** + lista de lojas **ordenada por distância**, com destaque para quem permite **retirada**.
- **Marcas / Marca** — vitrine por fabricante (3D Fila, Voolt, PrintaLot, 3DLab…).
- **Ranking** — melhores por custo/avaliação.
- **Dicas e tutoriais** — configurações de impressão por material (temperatura de bico/mesa, velocidade).
- **Cadastrar oferta** — loja **ou** usuário logado sugere uma oferta (entra em **moderação**).
- **Entrar / Painel da loja / Admin** — autenticação, área do anunciante, moderação e métricas.
- **Privacidade / Termos** + **banner de cookies** — conformidade com a LGPD.

## 6. Elementos visuais recorrentes (o "vocabulário" da interface)

Estes blocos aparecem o tempo todo e merecem tratamento de design forte e consistente:

- **Preço** e **custo total** (preço + frete) — protagonistas, em fonte mono, fáceis de comparar.
- **Frete estimado pro CEP** e **economia** vs. a média.
- **Selos/badges**: loja verificada, **patrocinado**, **oferta/economia**, **retira na loja**.
- **Seletor de CEP/região** (presente no topo).
- **Card de produto** e **card de loja**.
- **Mapa** com pinos (retira / entrega / "você").
- **Gráfico de histórico de preço** (eixos, período, linha de referência no mínimo).
- **Ranking** numerado.

## 7. Como ganhamos dinheiro (impacta o design)

- **Leads**: capturamos nome/e-mail antes de mandar para a loja.
- **Patrocínio / destaque** de lojas e marcas.
- **Afiliados** (comissão por indicação).

➡️ O design precisa acomodar **espaços patrocinados nativos e honestos**, **sem comprometer a neutralidade do ranking** (que é por custo) nem a confiança do usuário. Patrocinado deve ser sempre identificável.

## 8. Marca atual — "Fusão" (ponto de partida, pode evoluir)

- **Cores:** Laranja `#F2541B` (marca/energia), Teal `#0D9488` (apoio/tecnologia), Verde Oferta `#16A34A` (preço bom/economia). **Tema claro e escuro.**
- **Tipografia:** **Space Grotesk** (títulos), **Inter** (corpo), **Geist Mono** (preços e números).
- **Símbolo:** um **carretel de filamento** estilizado.
- Existe um sistema básico (tokens, cards, header/footer, páginas). **Você pode refinar ou repensar** a identidade, desde que mantenha clareza, confiança e o suporte a dark mode.

## 9. Personalidade e tom

Direto, confiável e **da comunidade maker brasileira**: "mão na massa", transparente sobre como o ranking funciona, sem ser corporativo frio nem infantilizado. Inspira economia inteligente e domínio técnico acessível.

## 10. Princípios de design

1. **Clareza de custo** — preço, frete e custo total sempre legíveis e comparáveis.
2. **Confiança** — selos, fontes de dados, neutralidade do ranking, prova social.
3. **Mobile-first** — a maioria acessa no celular; densidade de informação equilibrada.
4. **Acessível** — WCAG AA, foco visível, contraste, **dark mode**, `prefers-reduced-motion`.
5. **Rápido e leve** — performance é parte da experiência.
6. **Lida com a realidade dos dados** — nomes de produto longos, imagens vindas de lojas (às vezes ausentes), preços variáveis.

## 11. Contexto competitivo

Comparadores genéricos (Google Shopping, Buscapé/Zoom) não entendem o nicho 3D nem o **frete por CEP**. Lojas vendem só o próprio catálogo. Nosso diferencial: **especialização em impressão 3D + custo total por região + lojas perto + dicas da comunidade.** O design deve transmitir essa especialização e confiança.

## 12. O que queremos de você (objetivo e entregáveis)

**Objetivo:** elevar a marca e o design a um patamar memorável, confiável e que **converte** (informar CEP → comparar → clicar na oferta).

**Entregáveis sugeridos:**

- **Conceito de marca**: direção visual, paleta refinada, tipografia, princípios.
- **Logo e variações** (horizontal, símbolo, monocromática, favicon).
- **Design system / UI kit**: cores, tipografia, espaçamento, componentes (botões, cards, badges, tabelas, inputs, mapa, gráfico).
- **Iconografia e ilustração** próprias (carretel/impressora, estados vazios).
- **Telas-chave redesenhadas**: Home, Produto, Comparar, Perto de você — em **claro e escuro**, **desktop e mobile**.
- **Estados**: vazio, carregando, erro, sem oferta.

## 13. Restrições e realidade

- **pt-BR** em tudo; **mobile essencial**; **claro + escuro**.
- **LGPD**: banner de cookies e páginas de Privacidade/Termos existem e devem ser respeitadas.
- Preços, fretes e estoques são **estimativas** (vêm das lojas) — comunicar isso com honestiamente.
- O catálogo é dinâmico: prepare layouts para **conteúdo variável** (texto longo, imagem faltando).

## 14. Critérios de sucesso

- Mais **clareza** (custo total na hora), mais **confiança** (parece sério e neutro) e mais **conversão** (CEP → clique na oferta).
- Uma marca **memorável** que a comunidade maker queira recomendar.
- Consistência entre telas, em claro/escuro e em mobile/desktop.

## 15. Estado atual — mapa de telas (abra para ver o ponto de partida)

Rode `npm run dev` e abra `http://localhost:3000`. No topo de todas as telas há o **seletor de CEP** e a **alternância claro/escuro**.

| Tela | Rota | O que observar |
| --- | --- | --- |
| Home | `/` | hero, "informe seu CEP", como funciona, prévias de ranking e dicas |
| Filamentos | `/filamentos` | grade de produtos + filtros (material, marca, cor, diâmetro, preço) |
| Resinas | `/resinas` | idem, para resinas |
| Produto | `/produto/filamento-pla-amarelo` | ofertas por loja com frete e **custo total**, selos, **gráfico de histórico de preço**, avaliações |
| Comparar | `/comparar` | comparação com filtros ao vivo |
| Perto de você | `/perto` | **mapa interativo** + lista por distância + filtro "só com retirada" |
| Marcas | `/marcas` e `/marca/3d-fila` | vitrine por fabricante |
| Ranking | `/ranking` | melhores, numerado |
| Dicas | `/dicas` | configurações de impressão por material |
| Cadastrar oferta | `/cadastrar-oferta` | formulário + "puxar do link" |
| Entrar | `/entrar` | senha + magic link |
| Privacidade / Termos | `/privacidade`, `/termos` | páginas LGPD + banner de cookies |

Veja todas em **claro e escuro** e em **mobile (375px)** — o estado atual é o nosso "antes".

## 16. Referências de inspiração (e o que pegar de cada uma)

- **Comparadores** (Idealo, PriceRunner, Google Shopping, Zoom/Buscapé): leitura rápida de muitas ofertas e clareza de preço — mas são genéricos; nosso diferencial é o **custo total por CEP** e o nicho 3D.
- **Clareza numérica / confiança** (Wise, Nubank, Mercado Pago): números grandes e legíveis, hierarquia limpa, sensação de "sério e transparente", forte no mobile.
- **Universo maker/tech** (Prusa, Bambu Lab, Printables, iFixit): estética técnica e acessível, calorosa, com cara de comunidade — sem ser corporativa.
- **Local / "perto de você"** (iFood, Google Maps): padrões de mapa, distância e retirada.
- **Reputação de marketplace** (Mercado Livre): selos, avaliações e sinais de confiança aplicados a lojas.

Use como ponto de partida de linguagem visual — **não** para copiar; queremos identidade própria.

**Comece propondo a direção de marca e o conceito visual** (com racional), depois evolua para o design system e as telas-chave. Pode me fazer perguntas se algo do sistema não estiver claro.
