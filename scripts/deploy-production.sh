#!/usr/bin/env bash

set -euo pipefail

SITE_DIR="${INSIGHT_SITE_DIR:-/home/insight/htdocs/insight.info}"
COMPOSE_FILE="$SITE_DIR/docker-compose.production.yml"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this deployment script with sudo." >&2
  exit 1
fi

cd "$SITE_DIR"

if [[ ! -f .env ]]; then
  echo "Missing production environment file: $SITE_DIR/.env" >&2
  exit 1
fi

compose=(docker compose --env-file .env -p insight-info -f "$COMPOSE_FILE")

echo "Building production images..."
"${compose[@]}" build --pull app hub worker

echo "Starting production data services..."
"${compose[@]}" up -d --wait --wait-timeout 180 postgres redis clickhouse

echo "Applying PostgreSQL migrations..."
"${compose[@]}" run --rm --no-deps app bun run --cwd packages/database db:deploy

echo "Applying ClickHouse migrations..."
"${compose[@]}" run --rm --no-deps app sh -lc \
  'bunx clickhouse-migrations migrate --host "$CLICKHOUSE_HOST" --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" --db "$CLICKHOUSE_DB" --migrations-home ./packages/clickhouse/migrations'

if [[ "${SEED_DEMO:-0}" == "1" ]]; then
  echo "Seeding the production demo project and accounts..."
  "${compose[@]}" run --rm --no-deps app bun scripts/seed-local-demo.ts
fi

echo "Starting Insight.info services..."
"${compose[@]}" up -d --wait --wait-timeout 180 --remove-orphans app hub worker

curl --fail --silent --show-error --retry 12 --retry-delay 5 http://127.0.0.1:3015/ >/dev/null
curl --fail --silent --show-error --retry 12 --retry-delay 5 http://127.0.0.1:4004/up >/dev/null

echo "Insight.info production services are healthy."
