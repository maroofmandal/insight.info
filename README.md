# Insight.info

Insight.info is an open-source web and product analytics platform for understanding acquisition, activity, users, journeys and funnels in one workspace.

The product is a fork of the AGPL-licensed [Vemetric project](https://github.com/vemetric/vemetric). It preserves the upstream license and attribution while adding an original Insight.info identity, a single-origin marketing and documentation site, and readable public dashboards.

## Public dashboard URLs

A public project for `outbid.lol` is available at:

```text
https://insight.info/outbid.lol?t=24hrs
```

The legacy `/public/outbid.lol` route redirects to the new URL and preserves supported search parameters.

## Development

Requirements: [Bun](https://bun.sh), Docker and Docker Compose.

```bash
bun install
cp .env.example .env
docker compose up -d
bun turbo run db:generate --filter=database
bun dev
```

The local defaults are:

- Marketing site: `http://insight.localhost:4050`
- Application and backend: `http://app.insight.localhost:4050`
- Event ingestion: `http://insight.localhost:4050`

Production serves the marketing site, application, first-party SDK and event ingestion from `https://insight.info`. The browser SDK posts to the clean root endpoints (`/e`, `/i`, `/u`, `/r` and `/l`), while the private hub service remains isolated behind the application proxy.

## SDK compatibility

Published package names such as `@vemetric/web`, `@vemetric/react` and `@vemetric/node` remain unchanged. Configure compatible clients with `host: 'https://insight.info'` and use the first-party script at `https://insight.info/insight.min.js`. See the in-repository documentation under `apps/site/src/content/docs`.

## Commands

```bash
bun lint
bun run tsc
bun run test
bun run build
bun run e2e
```

## Configuration

New settings use `INSIGHT_*`. Where a compatibility alias exists, precedence is `INSIGHT_*`, then the legacy Vemetric variable, then the documented derived default. See [.env.example](.env.example).

Legal pages remain visible drafts with `noindex` until the legal entity, address, jurisdiction, effective date and publication status are configured.

## License and attribution

Insight.info is licensed under the [GNU Affero General Public License v3](LICENSE.md), matching the upstream project. Copyright notices and Git history are retained. Vemetric is the upstream project name and is referenced where required for license attribution, SDK compatibility and separate compatible services.
