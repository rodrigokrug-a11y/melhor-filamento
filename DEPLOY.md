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

## 4. Opção A — Vercel (recomendado)

1. Importe o repositório na Vercel.
2. Em **Settings → Environment Variables**, defina as variáveis da seção 2.
3. Build Command padrão (`npm run build`) funciona — o `postinstall` gera o Prisma Client e o build aplica as migrações pendentes.
4. Aponte o domínio `melhorfilamento.com.br` em **Settings → Domains**.

> `DATABASE_URL` precisa existir no ambiente de **build**, não só no de runtime: há rotas que leem o banco na geração estática, e é o build que aplica as migrações (seção 3).

### 4.1. Publicar pelo GitHub Actions (opcional)

Há um workflow em `.github/workflows/deploy.yml` que publica em produção a
cada push no `main`, e também sob demanda pelo botão **Run workflow** na aba
**Actions**. Ele termina com uma checagem de `/api/health`, para não dar por
bom um deploy que subiu sem alcançar o banco.

> **Escolha um caminho, não os dois.** Se a integração Vercel↔GitHub já
> publica automaticamente a cada push, mantenha o workflow desativado — os
> dois publicariam a mesma coisa em paralelo. Para usar o workflow, desligue
> o deploy automático em **Vercel → Settings → Git**.

O workflow fica **inerte enquanto os segredos não existirem**: sem eles o job
encerra em verde sem publicar nada, então nada quebra por deixá-lo parado.
Para ativar, adicione em **GitHub → Settings → Secrets and variables →
Actions**:

| Segredo | Onde encontrar |
| --- | --- |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `.vercel/project.json` após rodar `vercel link`, campo `orgId` |
| `VERCEL_PROJECT_ID` | mesmo arquivo, campo `projectId` |

As variáveis de ambiente da aplicação **não** viram segredo do GitHub: o
workflow roda `vercel pull` e busca as de produção direto do projeto na
Vercel.

## 5. Opção B — Docker / VPS

O `next.config.ts` já usa `output: "standalone"`. Há um `Dockerfile` multi-stage pronto.

```bash
# 1. Build da imagem — aplica as migrações pendentes e gera o app.
#    O DATABASE_URL vai como build-arg porque o `npm run build` de dentro da
#    imagem precisa dele tanto para migrar quanto para a geração estática.
docker build -t melhorfilamento \
  --build-arg DATABASE_URL="postgresql://..." \
  --build-arg NEXT_PUBLIC_SITE_URL="https://melhorfilamento.com.br" .

# 2. Rode o container (porta 3000)
docker run -p 3000:3000 --env-file .env.production melhorfilamento
```

> Atenção: aqui as migrações rodam ao **construir a imagem**, não ao publicá-la
> — a imagem fica atrelada ao banco apontado no build. Se preferir imagens
> agnósticas de ambiente, troque a linha `RUN npm run build` do `Dockerfile`
> por `RUN npx next build` e volte a rodar `npm run db:deploy` como passo
> separado de release.

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
