# Contributing to Insight.info

Thank you for helping improve Insight.info. Keep changes focused, include tests for behavior changes, and preserve the upstream AGPL license and attribution.

## Local setup

```bash
bun install
cp .env.example .env
docker compose up -d
bun turbo run db:generate --filter=database
bun dev
```

The default local endpoints are `insight.localhost:4050`, `app.insight.localhost:4050` and `hub.insight.localhost:4050`. Set `INSIGHT_DEV_PROXY_PORT` to change the proxy port, or `INSIGHT_DEV_PROXY_DISABLED=true` to run services directly.

Before proposing a change, run the relevant checks:

```bash
bun lint
bun run tsc
bun run test
bun run build
```

Keep internal `@vemetric/*` workspace and published SDK identifiers intact unless a migration is explicitly designed. New user-facing product copy should use Insight.info; Vemetric references should be limited to truthful compatibility or upstream attribution.

The historical upstream contributor agreement under `license/CLA.md` belongs to the upstream Vemetric project and does not establish an Insight.info contributor agreement.
