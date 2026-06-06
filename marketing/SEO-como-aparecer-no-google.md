# SEO — Como o MelhorFilamento vai aparecer no Google

## Diagnóstico (o que está acontecendo)

Rodamos `site:melhorfilamento.com.br` no Google: **zero páginas indexadas**.
Mas o problema **não é técnico** — o site está pronto pra ser indexado:

- ✅ `robots.txt` libera o rastreamento (bloqueia só admin/painel/api).
- ✅ `sitemap.xml` com **724 URLs**.
- ✅ Sem `noindex` em nenhuma página.
- ✅ `<title>`, descrição e **canonical** corretos em todas as páginas.
- ✅ JSON-LD nos produtos + (novo) **Organization + WebSite** no site todo.
- ✅ OpenGraph e favicon na identidade.

**A causa real:** o domínio é **novo** e o Google ainda **não o descobriu**. Sem
Search Console e sem links apontando pro site, o Google demora muito (ou nunca)
pra achar sozinho. A solução é avisar o Google — abaixo, em ordem de impacto.

---

## ✅ AÇÃO #1 — Google Search Console (o que destrava tudo)

> É de graça e é **a** ação que faz o site começar a aparecer. ~15 min.

1. Acesse **https://search.google.com/search-console** com sua conta Google.
2. **Adicionar propriedade → tipo "Domínio"** → digite `melhorfilamento.com.br`.
3. **Verificação por DNS (recomendado — não precisa de deploy):**
   - O Google mostra um registro **TXT** tipo `google-site-verification=XXXX`.
   - Adicione esse TXT no DNS do domínio (no painel da **Hostinger**, onde o
     domínio está): Tipo `TXT`, Nome/Host `@`, Valor = o texto do Google.
   - Volte ao Search Console e clique **Verificar** (pode levar alguns minutos
     pro DNS propagar).
   - *Alternativa sem DNS:* método **"tag HTML"** → me passe o código que ele
     der, eu coloco em `GOOGLE_SITE_VERIFICATION` no `.env` do servidor e
     republico. (O slot já está pronto no código.)
4. **Enviar o sitemap:** menu **Sitemaps** → digite `sitemap.xml` → **Enviar**.
5. **Forçar indexação das páginas principais:** use a barra **"Inspecionar
   URL"** no topo, cole a URL e clique **"Solicitar indexação"**. Faça para:
   - `https://melhorfilamento.com.br/`
   - `/filamentos` · `/resinas` · `/impressoras`
   - `/ofertas` · `/ranking` · `/marcas`
   - 2–3 produtos populares (ex.: um PLA e um PETG)

Depois disso, acompanhe em **Páginas** / **Cobertura**: em alguns dias as URLs
começam a sair de "Descoberta" para "Indexada".

---

## ✅ AÇÃO #2 — Bing Webmaster Tools (Bing + DuckDuckGo)

1. **https://www.bing.com/webmasters** → adicionar o site.
2. Dá pra **importar direto do Google Search Console** (1 clique).
3. Enviar o mesmo `sitemap.xml`.

---

## ✅ AÇÃO #3 — Primeiros backlinks (o Google descobre por links)

O Google chega a sites novos seguindo links. Crie alguns caminhos:

- **Instagram/Facebook:** coloque `melhorfilamento.com.br` na **bio** e nos
  posts (use as peças em `marketing/pecas/`). Link em perfil conta muito.
- **Google Business Profile** (Perfil da Empresa no Google), se aplicável.
- **Grupos/fóruns de impressão 3D:** participe e linke quando for útil (sem spam).
- **Diretórios/links de parceiros e lojas** que aparecem no comparador.
- Se você tiver outro site/projeto, um link de lá ajuda.

---

## ⏱️ Expectativa de tempo

- **Home e páginas pedidas via "Solicitar indexação":** horas a poucos dias.
- **Catálogo inteiro (sitemap):** alguns dias a semanas (o Google rastreia aos
  poucos).
- Aparecer pelo **nome** ("melhor filamento") tende a vir primeiro; ranquear
  para termos disputados ("filamento PLA") é trabalho contínuo de conteúdo/links.

---

## 🔧 O que já está pronto no código (não precisa mexer)

`robots.ts`, `sitemap.ts` (724 URLs), canonical por página, metadata/OG, JSON-LD
de produto, e agora **Organization + WebSite + SearchAction** (caixa de busca nos
resultados) e `robots: index,follow` explícito. Slot de verificação do Search
Console via env `GOOGLE_SITE_VERIFICATION`.

## 📈 Como medir o progresso

- No Google: pesquise `site:melhorfilamento.com.br` (mostra o que está indexado).
- No Search Console: **Páginas** (indexadas vs. não), **Desempenho** (cliques e
  impressões), **Sitemaps** (status de leitura).

---

### Próximos ganhos de SEO (quando quiser evoluir)

- Conteúdo de cauda longa: guias ("PLA x PETG", "por que a peça descola"),
  páginas de material/marca mais ricas.
- `BreadcrumbList` JSON-LD nas páginas internas.
- Reviews/AggregateRating no JSON-LD do produto (quando houver avaliações).
- Velocidade/Core Web Vitals (já está enxuto, mas vale monitorar no GSC).
