# Deploy — Melhor Filamento

Guia de publicação em produção. Stack: **Next.js 16 (App Router) + Prisma 7 (driver `pg`) + PostgreSQL**.

> **Produção hoje:** VPS (Hostinger) com **Docker Compose** — app e Postgres em
> containers, nginx do host fazendo proxy e TLS. É a seção 4. A **Vercel**
> (seção 5) fica registrada como alternativa, mas não é o que está no ar.

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

> ⚠️ Nunca faça commit de segredos. Em produção eles vivem no `.env` do VPS (não versionado), lido tanto pelo compose quanto pelo `scripts/deploy.sh`.

## 3. Banco de dados (migrações)

As migrações rodam **automaticamente no build**: o script `build` é
`prisma migrate deploy && next build`. Não há passo manual por release — subir
código que depende de uma coluna nova sem ela existir quebraria o site, então
a ordem está garantida pelo próprio build. O `prisma generate` roda sozinho no
`postinstall`. As migrações **não** rodam seed.

Consequências que valem conhecer:

- O ambiente de **build** precisa de `DATABASE_URL` apontando para produção.
  (Já precisava: há rotas que leem o banco na geração estática.)
- Se uma migração falhar, o **deploy inteiro falha** e a versão antiga
  continua no ar — que é o comportamento desejado.
- Se o processo for **interrompido** no meio de uma migração, o Prisma marca
  aquela migração como falha e passa a recusar os deploys seguintes com o erro
  `P3009`. Nesse caso, resolva com `prisma migrate resolve` antes de tentar de
  novo: veja https://pris.ly/d/migrate-resolve

Para aplicar as migrações fora de um deploy (por exemplo, ao restaurar um
banco), o mesmo comando está disponível avulso:

```bash
npm run db:deploy
```

## 4. VPS + Docker Compose (o que está em produção)

O `next.config.ts` usa `output: "standalone"`, e o `docker-compose.prod.yml`
sobe dois containers: `mf-prod-app` (o Next) e `mf-prod-db` (Postgres, com
volume `mf_prod_pgdata`). O app escuta só em `127.0.0.1:${APP_PORT}` — quem
expõe na internet é o **nginx do host**, que também termina o TLS.

As variáveis da seção 2 ficam num `.env` **no VPS**, fora do versionamento.

### Publicar

Da pasta do projeto no VPS:

```bash
./scripts/deploy.sh
```

O script faz a sequência inteira: `git pull` do `main`, sobe o Postgres e
espera ficar saudável, constrói a imagem **na rede do compose** (necessário
porque o build aplica as migrações e a geração estática lê o banco — sem a
rede, o host `db` do `DATABASE_URL` não resolve), recria o container do app e
confere `/api/health` antes de dar o deploy por concluído.

Para publicar sem atualizar o código, use `./scripts/deploy.sh --no-pull`.

Se algo falhar, o script encerra com uma mensagem apontando o próximo passo —
não há estado pela metade que passe silenciosamente.

### Fazendo à mão

Se precisar rodar os passos separados:

```bash
docker compose -f docker-compose.prod.yml up -d db
NET=$(docker inspect mf-prod-db --format '{{range $n, $_ := .NetworkSettings.Networks}}{{$n}}{{end}}')
docker build --network "$NET" \
  --build-arg DATABASE_URL="postgresql://..." \
  --build-arg NEXT_PUBLIC_SITE_URL="https://melhorfilamento.com.br" \
  --build-arg NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="..." \
  -t melhorfilamento-app:latest .
docker compose -f docker-compose.prod.yml up -d --force-recreate app
```

> As migrações rodam ao **construir a imagem**, não ao publicá-la — a imagem
> fica atrelada ao banco apontado no build. Se preferir imagens agnósticas de
> ambiente, troque `RUN npm run build` no `Dockerfile` por `RUN npx next build`
> e rode `npm run db:deploy` como passo separado de release.

Imagens antigas se acumulam a cada deploy; `docker image prune -f` limpa as
camadas órfãs quando o disco apertar.

## 5. Alternativa — Vercel

Registrado para o caso de uma migração futura; **não é o que está no ar**.

1. Importe o repositório na Vercel.
2. Em **Settings → Environment Variables**, defina as variáveis da seção 2.
3. Build Command padrão (`npm run build`) funciona — o `postinstall` gera o Prisma Client e o build aplica as migrações pendentes.
4. Aponte o domínio em **Settings → Domains**.

> `DATABASE_URL` precisa existir no ambiente de **build**, não só no de runtime: há rotas que leem o banco na geração estática, e é o build que aplica as migrações (seção 3).

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
