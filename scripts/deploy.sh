#!/usr/bin/env bash
# Deploy de produção no VPS (Docker Compose + nginx do host).
#
# Sequência: atualiza o código, sobe o Postgres, constrói a imagem já na rede
# do banco — é durante o build que as migrações são aplicadas e que a geração
# estática lê os dados — e troca o container do app. Termina conferindo
# /api/health, para não dar por concluído um deploy que subiu sem banco.
#
# Uso:
#   ./scripts/deploy.sh             # atualiza para o topo do main e publica
#   ./scripts/deploy.sh --no-pull   # publica o que já está no diretório

set -Eeuo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
IMAGE="melhorfilamento-app:latest"
DB_CONTAINER="mf-prod-db"

cd "$(dirname "$0")/.."

die() {
  echo "erro: $*" >&2
  exit 1
}

[ -f .env ] || die ".env não encontrado — é ele que guarda as variáveis de produção (não versionado)."

# As mesmas variáveis que o compose passa ao container em runtime; aqui elas
# são necessárias em tempo de build (migrações, SSG e valores inlinados).
set -a
# shellcheck disable=SC1091
. ./.env
set +a

: "${DATABASE_URL:?defina DATABASE_URL no .env}"
: "${NEXT_PUBLIC_SITE_URL:?defina NEXT_PUBLIC_SITE_URL no .env}"

if [ "${1:-}" != "--no-pull" ]; then
  echo "==> Atualizando o código"
  git pull --ff-only origin main
fi
echo "    commit: $(git rev-parse --short HEAD) $(git log -1 --pretty=%s)"

echo "==> Subindo o Postgres"
docker compose -f "$COMPOSE_FILE" up -d db

echo "==> Aguardando o banco aceitar conexões"
db_health() {
  docker inspect -f '{{.State.Health.Status}}' "$DB_CONTAINER" 2>/dev/null || echo "unknown"
}
for _ in $(seq 1 60); do
  [ "$(db_health)" = "healthy" ] && break
  sleep 2
done
[ "$(db_health)" = "healthy" ] || die "o Postgres não ficou saudável a tempo (docker compose -f $COMPOSE_FILE logs db)"

# O build precisa resolver o host do banco que está no DATABASE_URL; por isso
# roda na rede do compose, e não na rede padrão do docker build.
NETWORK=$(docker inspect "$DB_CONTAINER" \
  --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}} {{end}}' |
  awk '{print $1}')
[ -n "$NETWORK" ] || die "não consegui descobrir a rede do container $DB_CONTAINER"

echo "==> Construindo a imagem na rede $NETWORK (as migrações rodam aqui)"
docker build \
  --network "$NETWORK" \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:-}" \
  --build-arg NEXT_PUBLIC_GA_ID="${NEXT_PUBLIC_GA_ID:-}" \
  --build-arg NEXT_PUBLIC_GOOGLE_ADS_ID="${NEXT_PUBLIC_GOOGLE_ADS_ID:-}" \
  -t "$IMAGE" .

# --force-recreate porque a tag não muda: sem isso, um build novo poderia não
# trocar o container e o deploy passaria silenciosamente em branco.
echo "==> Trocando o container do app"
docker compose -f "$COMPOSE_FILE" up -d --force-recreate app

echo "==> Conferindo a saúde do app"
port="${APP_PORT:-3000}"
for attempt in $(seq 1 10); do
  body=$(curl -fsS --max-time 10 "http://127.0.0.1:${port}/api/health" 2>/dev/null) || body=""
  case "$body" in
  *'"db":"up"'*)
    echo "    $body"
    echo "==> Deploy concluído."
    exit 0
    ;;
  esac
  echo "    tentativa $attempt: ainda sem resposta saudável"
  sleep 3
done

die "o container subiu mas /api/health não confirmou o banco — veja: docker compose -f $COMPOSE_FILE logs --tail=50 app"
