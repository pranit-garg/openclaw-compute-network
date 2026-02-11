FROM node:20-slim AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy root config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

# Copy package.json + tsconfig for each needed workspace package
COPY packages/protocol/package.json packages/protocol/tsconfig.json packages/protocol/
COPY packages/erc8004/package.json packages/erc8004/tsconfig.json packages/erc8004/
COPY apps/coordinator-core/package.json apps/coordinator-core/tsconfig.json apps/coordinator-core/
COPY apps/coordinator-solana/package.json apps/coordinator-solana/tsconfig.json apps/coordinator-solana/

# Install ALL dependencies
RUN pnpm install --frozen-lockfile --filter @dispatch/coordinator-solana...

# Copy source files
COPY packages/protocol/src/ packages/protocol/src/
COPY packages/erc8004/src/ packages/erc8004/src/
COPY apps/coordinator-core/src/ apps/coordinator-core/src/
COPY apps/coordinator-solana/src/ apps/coordinator-solana/src/

# Build TypeScript
RUN npx tsc --build packages/protocol/tsconfig.json && \
    cd packages/erc8004 && npx tsc && cd /app && \
    npx tsc --build apps/coordinator-core/tsconfig.json && \
    npx tsc --build apps/coordinator-solana/tsconfig.json

# Bundle into single ESM file
RUN npm install -g esbuild && esbuild apps/coordinator-solana/dist/index.js \
    --bundle \
    --platform=node \
    --format=esm \
    --outfile=/app/server.mjs \
    --banner:js="import{createRequire}from'module';const require=createRequire(import.meta.url);" \
    --external:better-sqlite3 \
    --external:bufferutil \
    --external:utf-8-validate \
    --external:bs58

# Runtime — Node 18.18 (before --loader deprecation in 18.19)
FROM node:18.18-slim
WORKDIR /srv

# Minimal package.json for ESM + native deps (tsx needed for Node ESM hooks)
RUN echo '{"type":"module","dependencies":{"better-sqlite3":"^11.7.0","tsx":"^3.14.0","bs58":"^5.0.0"}}' > package.json && \
    npm install --omit=dev

# Copy the bundled server
COPY --from=build /app/server.mjs ./server.mjs

# Create data directory for SQLite
RUN mkdir -p /srv/data

# Entrypoint that prints env debug then starts
RUN printf '#!/bin/sh\nset\nexec node server.mjs\n' > /srv/start.sh && \
    chmod +x /srv/start.sh

ENV TESTNET_MODE=true
ENV PORT=4020
EXPOSE 4020

ENTRYPOINT ["/bin/sh", "/srv/start.sh"]
