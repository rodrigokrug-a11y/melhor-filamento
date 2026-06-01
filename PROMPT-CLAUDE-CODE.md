# Prompt para o Claude Code — Evolução de marca e produto

> Copie tudo abaixo da linha e cole como primeira mensagem no Claude Code, dentro deste repositório.

---

Você vai **evoluir a marca e o site do Melhor Filamento** — sem reescrever a arquitetura, elevando identidade visual, conversão, conteúdo/SEO, performance e acessibilidade. Trabalhe com qualidade de produto sênior e atenção a detalhe.

## Contexto do produto

- **O que é:** comparador de preços de **filamentos e resinas para impressão 3D no Brasil**. Mostra a melhor oferta por **custo total (preço + frete)** para o **CEP** do visitante, lojas **perto de você** (mapa) e monetiza por **geração de leads** e patrocínios.
- **Público:** comunidade maker brasileira (hobbistas e pequenos negócios). Idioma: **pt-BR**, sempre.
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4 (CSS-first), Prisma 7 + PostgreSQL (driver `pg`), Auth.js v5 (JWT), Leaflet/react-leaflet, Zod, Vitest.

## Marca atual ("Fusão") — ponto de partida, não camisa de força

- **Cores:** Laranja `#F2541B` (marca), Teal `#0D9488` (apoio), Verde Oferta `#16A34A` (preço/economia). Tema **claro e escuro** com alternância.
- **Tipografia:** Space Grotesk (títulos), Inter (corpo), Geist Mono (preços/números).
- **Tokens e utilidades já existem** em `src/app/globals.css` (`bg-brand`, `text-teal`, `bg-offer`, `font-display`, `tnum`, `bg-brand-soft`, `.reveal`). Há `Logo`, `PageHeader`, `ProductCard`, `Reveal`, `ThemeToggle`, header/footer e páginas LGPD (`/privacidade`, `/termos`) + banner de cookies.
- Você **pode propor uma evolução** da identidade (refino de paleta, escala tipográfica, sistema de espaçamento/elevação, movimento) desde que mantenha coerência e o suporte a dark mode.

## Como trabalhar neste repo (regras do projeto — obrigatórias)

1. **Leia primeiro:** `AGENTS.md`, `CLAUDE.md` e, antes de escrever qualquer código de framework, o guia relevante em `node_modules/next/dist/docs/`. **"This is NOT the Next.js you know"** — `params`/`searchParams` são `Promise`; respeite avisos de deprecação.
2. **Fluxo incremental:** **proponha o plano e aguarde o "ok"** antes de implementar. Depois entregue **módulo a módulo**, rodando `npm run lint`, `npx tsc --noEmit`, `npm run build` e `npm run test` a cada módulo, com um **resumo curto em pt-BR** ao final de cada um.
3. **Regra de hooks (lint `react-hooks/set-state-in-effect`):** nada de `setState` síncrono dentro de `useEffect`; nada de `Date.now()`/`new Date()` sem argumento durante o render. Use `useSyncExternalStore`, observe classes via `MutationObserver`, ancore em dados ou faça `setState` em callback assíncrono (`.then`). Veja `src/lib/region-store.ts` e `src/lib/consent-store.ts` como padrão.
4. **Tailwind v4 CSS-first:** tokens em `@theme inline` com **hex**; `@custom-variant dark`; `@utility`. Não introduza `tailwind.config.js` no estilo antigo. Reutilize as utilidades de marca.
5. **Segurança:** segredos **somente via variáveis de ambiente**, nunca hardcode. Senhas só como hash bcrypt. Em scraping: **respeite `robots.txt`**, use o User-Agent do bot e **não burle anti-bot** (Cloudflare etc.). Mantenha o guard de SSRF.
6. **LGPD:** preserve conformidade (consentimento, finalidade, direitos do titular) ao tocar em dados pessoais.
7. **Mobile-first:** tudo precisa funcionar bem no celular. Grids sempre com base `grid-cols-1`.
8. **Não quebre** o que já passa: mantenha lint/typecheck/build/test verdes.

## Objetivo

Deixar o site **memorável, confiável e que converte** — uma marca que a comunidade maker queira recomendar. Evolua a identidade, refine cada tela e fortaleça os fluxos de conversão e descoberta, mantendo performance e acessibilidade.

## Frentes de trabalho (proponha um plano priorizado a partir destas)

1. **Sistema de marca:** refinar o `Logo` (variações: horizontal, símbolo, monocromática, favicon/PWA), escala tipográfica e de espaçamento, elevação/sombras, princípios de movimento. Documentar em uma página interna de guia de marca ou em `docs/`.
2. **Ilustração e iconografia:** arte própria (carretel/impressora), ilustrações para estados vazios, ícones consistentes — leves e em SVG, compatíveis com dark mode.
3. **Home e landing:** hero mais forte com proposta de valor clara, prova social, sinais de confiança, "como funciona" e copy otimizada para SEO. Reduzir fricção até a primeira comparação.
4. **Conversão e UX de lead:** melhorar o lead-gate e o fluxo "Ver oferta", hierarquia de CTAs, blocos patrocinados nativos e estrutura pronta para experimentação (A/B).
5. **Conteúdo e SEO programático:** páginas por material/marca/cidade, JSON-LD refinado (`Product`/`ProductGroup`/`Offer`/`BreadcrumbList`), links internos, FAQ, blog/dicas, frescor de sitemap.
6. **Performance / Core Web Vitals:** otimização de imagens (`next/image`), carregamento de fontes, mapa Leaflet sob demanda, enxugar bundle, cuidar de LCP/CLS/INP.
7. **Acessibilidade (WCAG AA):** contraste, foco visível, navegação por teclado, `aria-*`, ordem semântica, `prefers-reduced-motion`.
8. **Visualização de dados:** evoluir o gráfico de histórico de preços e a UX de comparação (`/comparar`), com clareza de eixos e leitura mobile.
9. **Confiança e prova social:** avaliações, selos "verificado", perfis de loja, transparência de metodologia do ranking.

## Entregáveis

- Plano priorizado (proposto e aprovado antes de codar).
- Implementação por módulos, com componentes reutilizáveis e tokens centralizados.
- Antes/depois das telas principais (descreva ou capture via preview).
- Documentação curta do sistema de marca (paleta, tipografia, componentes, do/don't).

## Critérios de aceite

- `npm run lint`, `npx tsc --noEmit`, `npm run build` e `npm run test` **verdes**.
- Funciona em **mobile** e em **dark mode**; respeita `prefers-reduced-motion`.
- Sem segredos hardcoded; pt-BR consistente; LGPD preservada.
- Melhora mensurável de clareza visual, hierarquia e fluxo de conversão, sem regressões de performance.

Comece **lendo `AGENTS.md` + a documentação relevante do Next**, depois **proponha o plano priorizado e aguarde meu "ok"**.
