# Deploy — Melhor Filamento

Guia de publicação em produção. Stack: **Next.js 16 (App Router) + Prisma 7 (driver `pg`) + PostgreSQL**.

> Recomendado: **Vercel + Postgres gerenciado** (Neon/Supabase) para o caminho zero-config. O **Docker** é a alternativa portátil (VPS, Railway, Fly, Render).

---

## 1. Pré-requisitos

- Node.js 22+
- Um PostgreSQL acessível (Neon, Supabase, RDS, ou seu próprio)
- Um provedor SMTP (Resend, Brevo, Amazon SES, Mailgun…) para e-mails de login e notificação de leads

## 2. Variáveis de ambiente

Copie de `.env.example`. Em produção, defina:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL. |
| `AUTH_SECRET` | ✅ | Segredo do Auth.js. Gere com `npx auth secret` ou `openssl rand -base64 32`. |
| `AUTH_URL` | ✅ | URL pública (ex.: `https://melhorfilamento.com.br`). |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Mesma URL pública (usada em metadata/OG/sitemap). |
| `ADMIN_EMAILS` | ✅ | E-mails com acesso ao `/admin` e que recebem notificação de leads (separados por vírgula). |
| `EMAIL_FROM` | ✅ | Remetente dos e-mails. |
| `EMAIL_SERVER` _ou_ `SMTP_*` | ✅ | DSN SMTP completo **ou** `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_SECURE`. |
| `INGEST_SECRET` | ⬜ | Segredo do `POST /api/ingest` (cron de ingestão). |
| `CONTACT_EMAIL` | ⬜ | E-mail exibido nas páginas LGPD (padrão: contato@…). |

> ⚠️ Nunca faça commit de segredos. Em produção, defina-os no painel do provedor (Vercel/host) ou em um gerenciador de segredos.

## 3. Banco de dados (migrações)

As migrações **não** rodam seed e devem ser aplicadas a cada deploy:

```bash
npx prisma migrate deploy
```

Rode esse comando no pipeline de release (com `DATABASE_URL` apontando para produção), **antes** de subir a nova versão do app. O `prisma generate` roda sozinho no `postinstall`.

## 4. Opção A — Vercel (recomendado)

1. Importe o repositório na Vercel.
2. Em **Settings → Environment Variables**, defina as variáveis da seção 2.
3. Build Command padrão (`next build`) funciona — o `postinstall` gera o Prisma Client.
4. Migrações: rode `npx prisma migrate deploy` como passo de release (Vercel “Deploy Hook”/CI) ou manualmente após apontar `DATABASE_URL` para produção.
5. Aponte o domínio `melhorfilamento.com.br` em **Settings → Domains**.

> Se alguma rota for renderizada estaticamente lendo o banco, garanta `DATABASE_URL` disponível também no ambiente de **build**.

## 5. Opção B — Docker / VPS

O `next.config.ts` já usa `output: "standalone"`. Há um `Dockerfile` multi-stage pronto.

```bash
# 1. Build da imagem
docker build -t melhorfilamento .

# 2. Migre o banco (uma vez por release)
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 3. Rode o container (porta 3000)
docker run -p 3000:3000 --env-file .env.production melhorfilamento
```

O container roda como usuário sem privilégios e serve `node server.js`. Coloque um proxy reverso (Caddy/Nginx) na frente para TLS, ou use a TLS do provedor.

## 6. Pós-deploy (checklist)

- [ ] `GET /api/health` retorna `{ "status": "ok", "db": "up" }`
- [ ] Login por senha e magic link funcionam (cheque o SMTP)
- [ ] `/admin` acessível apenas para `ADMIN_EMAILS`
- [ ] Definir a senha do admin: `npm run set-password` (lê a senha de variável de ambiente — nunca hardcode)
- [ ] `/sitemap.xml` e `/robots.txt` com a URL pública correta
- [ ] Cadastro de oferta e captura de lead gerando e-mail de notificação
- [ ] Banner de cookies aparece e some após “Aceitar”
- [ ] Páginas `/privacidade` e `/termos` com o `CONTACT_EMAIL` correto

## 7. Cron de ingestão (opcional)

Para atualizar ofertas periodicamente, agende um `POST` autenticado:

```bash
curl -X POST https://SEU-DOMINIO/api/ingest -H "x-ingest-secret: $INGEST_SECRET"
```

Use o cron do provedor (Vercel Cron, GitHub Actions, etc.).
