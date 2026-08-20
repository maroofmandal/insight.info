FROM oven/bun:1.3.11-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl wget && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

FROM base AS build
COPY . .
RUN bun install --ignore-scripts --frozen-lockfile
RUN bun run --cwd packages/database db:generate

FROM base AS release
ENV NODE_ENV=production
COPY --from=build /usr/src/app ./

CMD ["bun", "run", "apps/worker/src/index.ts"]
