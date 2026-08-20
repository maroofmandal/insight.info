FROM oven/bun:1.3.11-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl wget && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

FROM base AS build
COPY . .
RUN bun install --ignore-scripts --frozen-lockfile
RUN bun run --cwd packages/database db:generate

ARG INSIGHT_SITE_URL=https://insight.info
ARG INSIGHT_APP_URL=https://insight.info
ARG INSIGHT_HUB_URL=https://insight.info
ARG INSIGHT_SINGLE_ORIGIN=true
ARG INSIGHT_TOPO_URL=https://insight.info/topo.json
ARG INSIGHT_SOURCE_URL=https://github.com/maroofmandal/insight.info
ENV INSIGHT_SITE_URL=$INSIGHT_SITE_URL \
    INSIGHT_APP_URL=$INSIGHT_APP_URL \
    INSIGHT_HUB_URL=$INSIGHT_HUB_URL \
    INSIGHT_SINGLE_ORIGIN=$INSIGHT_SINGLE_ORIGIN \
    INSIGHT_TOPO_URL=$INSIGHT_TOPO_URL \
    INSIGHT_SOURCE_URL=$INSIGHT_SOURCE_URL

RUN bun turbo run build --filter=app

FROM base AS release
ENV NODE_ENV=production
COPY --from=build /usr/src/app ./

EXPOSE 4000
CMD ["bun", "run", "apps/app/src/backend/index.ts"]
