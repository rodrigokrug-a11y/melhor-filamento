# Melhor Filamento

Comparador de preços de **filamentos e resinas para impressão 3D** no Brasil.
O ranking padrão considera o **custo total para o seu CEP** (preço − cupom + frete
estimado), priorizando a oferta mais barata por região. Construído com foco em SEO
e em uma base para monetização via geração de leads (cliques rastreáveis).

> Conteúdo voltado ao usuário final em **pt-BR**. Toda configuração sensível vem de
> **variáveis de ambiente** — nada de credenciais no código.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict) + **ESLint 9** (flat config) + **Prettier**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 7** + **PostgreSQL** (driver adapter `@prisma/adapter-pg`)
- **Zod 4** para validação de entradas
- **Vitest 4** para testes

## Pré-requisitos

- Node.js 20+ (testado em 22/25)
- PostgreSQL 16 (local via Docker ou um banco gerenciado)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo e ajuste os valores:

   ```bash
   cp .env.example .env
   ```

   Variáveis:

   | Variável               | Descrição                                                            |
   | ---------------------- | ------------------------------------------------------------------- |
   | `DATABASE_URL`         | String de conexão PostgreSQL.                                       |
   | `NEXT_PUBLIC_SITE_URL` | URL pública (metadata, sitemap, JSON-LD, UTMs).                     |
   | `AUTH_SECRET`          | Segredo do Auth.js (`npx auth secret` ou `openssl rand -base64 32`).|
   | `AUTH_URL`             | URL base do Auth.js (ex.: `http://localhost:3000`).                |
   | `EMAIL_FROM`           | Remetente dos e-mails de login.                                    |
   | `EMAIL_SERVER`         | SMTP do magic link. Vazio em dev → o link é impresso no console.   |
   | `ADMIN_EMAILS`         | E-mails com acesso ao `/admin` (separados por vírgula).            |

## Banco de dados

### Opção A — PostgreSQL local com Docker

```bash
docker compose up -d        # sobe o Postgres em localhost:5432
npm run db:migrate          # aplica as migrations
npm run db:seed             # popula dados de exemplo
```

### Opção B — Banco gerenciado

Defina `DATABASE_URL` no `.env` apontando para o seu banco e rode:

```bash
npm run db:migrate
npm run db:seed
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Funcionalidades

- **Catálogo público:** home, `/filamentos`, `/resinas` (filtros por material/marca e
  ordenação) e ficha do produto com **comparativo de ofertas**.
- **Ranking por CEP:** informe o CEP no topo (ViaCEP + geolocalização) e o comparativo
  reordena pelo **custo total = preço − cupom + frete estimado** (resolução de frete
  UF > região > nacional). Sem CEP, ordena pelo preço de tabela.
- **Cliques rastreáveis:** todo “Ver oferta” passa por `/go/[offerId]`, que registra um
  `ClickEvent` (sessão, CEP/UF/região, referrer) e redireciona para a loja com UTMs.
- **Área do vendedor:** login por e-mail (magic link), `/painel` para gerenciar a loja
  e `/cadastrar-oferta` (ofertas entram como `PENDING`).
- **Admin (`/admin`):** dashboard de cliques, moderação (aprovar/rejeitar), patrocínios,
  verificação de lojas e cadastro de marcas/produtos.
- **SEO:** metadata + OpenGraph/Twitter, imagens OG dinâmicas, JSON-LD
  (Product/AggregateOffer), `sitemap.xml`, `robots.txt` e ISR nas páginas de produto.

## Autenticação em desenvolvimento

Sem `EMAIL_SERVER`, o **link de acesso (magic link)** é impresso no console do servidor
(`.next/dev/logs/next-development.log`). Copie o link e abra no navegador para entrar.
Para acessar o `/admin`, inclua o seu e-mail em `ADMIN_EMAILS`.

## Scripts

| Script                | O que faz                                      |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento.                   |
| `npm run build`       | Build de produção.                             |
| `npm run start`       | Sobe o build de produção.                      |
| `npm run lint`        | ESLint.                                        |
| `npm run format`      | Prettier (escreve as alterações).              |
| `npm run typecheck`   | Checagem de tipos (`tsc --noEmit`).            |
| `npm test`            | Testes (Vitest).                               |
| `npm run db:generate` | Gera o Prisma Client.                          |
| `npm run db:migrate`  | Cria/aplica migrations em desenvolvimento.     |
| `npm run db:seed`     | Popula o banco com dados de exemplo.           |
| `npm run db:reset`    | Reseta o banco e roda seed.                    |
| `npm run db:studio`   | Abre o Prisma Studio.                          |

## Estrutura

```
prisma/            schema.prisma, seed e migrations
src/
  app/             rotas (App Router): catálogo, produto, go, painel, admin, api/auth
  components/      UI (shadcn) e componentes de domínio
  lib/             db (Prisma), pricing, shipping, catalog, region, viacep, auth helpers, seo
  auth.ts          configuração do Auth.js (magic link + Prisma adapter)
tests/             testes unitários (pricing, shipping)
```

## Qualidade

```bash
npm run lint && npm run typecheck && npm test && npm run build
```
