# syntax=docker/dockerfile:1
# Build de produção do Melhor Filamento (Next 16 standalone + Prisma 7 / pg).

# ---- deps: instala dependências e gera o Prisma Client (sem acessar o banco) ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
# Copiamos o schema antes do install para o postinstall (prisma generate) rodar.
COPY package.json package-lock.json* prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---- builder: compila o Next em modo standalone ----
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-args do next build:
#  - DATABASE_URL: SSG e sitemap leem o banco em tempo de build.
#  - NEXT_PUBLIC_SITE_URL: é "inlined" no bundle (OG/canonical/sitemap) — precisa no build.
#  - NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: chave AES estável p/ Server Actions —
#    sem ela o Next gera uma nova a cada build e abas antigas quebram com
#    "Failed to find Server Action" após um deploy. É embutida no build.
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
# Analytics (públicos, inlinados no bundle do cliente). Vazios => tag não carrega.
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GOOGLE_ADS_ID
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_PUBLIC_GOOGLE_ADS_ID=${NEXT_PUBLIC_GOOGLE_ADS_ID}
RUN npm run build

# ---- runner: imagem mínima que serve o app ----
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Saída standalone do Next (server.js + node_modules mínimos, inclui Prisma).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
# As migrações são aplicadas fora do container (npx prisma migrate deploy).
CMD ["node", "server.js"]
