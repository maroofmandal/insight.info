#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required. Install it from https://bun.sh and run this script again." >&2
  exit 1
fi

APP_PORT="${PORT:-3005}"
USING_LOCAL_DEFAULTS=0

export PORT="$APP_PORT"
export NODE_ENV="production"
export INSIGHT_BASE_DOMAIN="${INSIGHT_BASE_DOMAIN:-localhost:${APP_PORT}}"
export INSIGHT_SITE_URL="${INSIGHT_SITE_URL:-http://localhost:${APP_PORT}}"
export INSIGHT_APP_URL="${INSIGHT_APP_URL:-http://localhost:${APP_PORT}}"
export INSIGHT_HUB_URL="${INSIGHT_HUB_URL:-http://localhost:${APP_PORT}}"
export INSIGHT_HUB_INTERNAL_URL="${INSIGHT_HUB_INTERNAL_URL:-http://localhost:4004}"
export INSIGHT_SINGLE_ORIGIN="${INSIGHT_SINGLE_ORIGIN:-true}"
export INSIGHT_TOPO_URL="${INSIGHT_TOPO_URL:-http://localhost:${APP_PORT}/topo.json}"

# Allow the marketing site and application shell to run without a local .env.
# Real analytics, authentication, and billing still require their backing services.
if [[ ! -f .env ]]; then
  USING_LOCAL_DEFAULTS=1
  export INSIGHT_TOKEN="${INSIGHT_TOKEN:-local-preview-token}"
  export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@localhost:5433/vemetric?schema=public}"
  export CLICKHOUSE_HOST="${CLICKHOUSE_HOST:-http://localhost:8123}"
  export CLICKHOUSE_USER="${CLICKHOUSE_USER:-default}"
  export CLICKHOUSE_PASSWORD="${CLICKHOUSE_PASSWORD:-password}"
  export CLICKHOUSE_DB="${CLICKHOUSE_DB:-vemetric}"
  export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
  export EMAIL_TOKEN_SECRET="${EMAIL_TOKEN_SECRET:-local-email-token-secret}"
  export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-local-better-auth-secret-change-me}"
  export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:${APP_PORT}}"
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  bun install
fi

if [[ "$USING_LOCAL_DEFAULTS" == "1" && "${INSIGHT_START_SERVICES:-1}" == "1" ]]; then
  if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
    echo "Docker Desktop must be running to start the local PostgreSQL and ClickHouse services." >&2
    exit 1
  fi

  echo "Starting local data services..."
  docker compose up -d postgres redis clickhouse

  SERVICES_READY=0
  for _attempt in {1..30}; do
    if docker compose exec -T postgres pg_isready -U postgres -d vemetric >/dev/null 2>&1 \
      && bun -e "const response = await fetch('http://localhost:8123/ping'); if (!response.ok) process.exit(1)" \
        >/dev/null 2>&1; then
      SERVICES_READY=1
      break
    fi
    sleep 1
  done

  if [[ "$SERVICES_READY" != "1" ]]; then
    echo "Local data services did not become ready in time." >&2
    exit 1
  fi

  echo "Applying local database migrations..."
  bun run --cwd packages/database db:deploy
  bunx clickhouse-migrations migrate \
    --host "$CLICKHOUSE_HOST" \
    --user "$CLICKHOUSE_USER" \
    --password "$CLICKHOUSE_PASSWORD" \
    --db "$CLICKHOUSE_DB" \
    --migrations-home ./packages/clickhouse/migrations

  if [[ "${SKIP_SEED:-0}" != "1" ]]; then
    echo "Seeding local demo data and users..."
    bun scripts/seed-local-demo.ts
  fi
fi

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "Building Insight.info..."
  bun run build
fi

echo "Starting Insight.info at http://localhost:${APP_PORT}"
exec bun apps/app/src/backend/index.ts
