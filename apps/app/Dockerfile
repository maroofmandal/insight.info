FROM oven/bun:1.3.11-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl wget && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

FROM base AS pruner
RUN bun add -g turbo@2.6.1
COPY . .
RUN bun turbo prune app --docker --out-dir out

FROM base AS install
COPY --from=pruner /usr/src/app/out/json/ .
RUN bun install --ignore-scripts --frozen-lockfile

FROM install AS build
COPY --from=pruner /usr/src/app/out/full/ .
ARG INSIGHT_SITE_URL=https://insight.info
ARG INSIGHT_APP_URL=https://insight.info
ARG INSIGHT_HUB_URL=https://insight.info/hub
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

FROM base AS prod-install
COPY --from=pruner /usr/src/app/out/json/ .
RUN bun install --production --ignore-scripts --frozen-lockfile

FROM base AS release
ENV NODE_ENV=production

COPY --from=pruner /usr/src/app/out/full/ ./
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/apps/app/dist ./apps/app/dist
COPY --from=build /usr/src/app/apps/site/dist ./apps/site/dist
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY scripts ./scripts

EXPOSE 4000
 
CMD [ "bun", "run", "apps/app/src/backend/index.ts" ]
