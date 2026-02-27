FROM node:24-slim AS base
WORKDIR /app
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}
RUN corepack enable pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/root/.pnpm-store,id=pnpm-store-ptm,sharing=locked \
  pnpm config set store-dir /root/.pnpm-store && \
  pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./

# Install only production deps
RUN --mount=type=cache,target=/root/.pnpm-store,id=pnpm-store-ptm,sharing=locked \
  pnpm config set store-dir /root/.pnpm-store && \
  pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Ensure runtime has access to graphql schema files required by server code
COPY --from=builder /app/src/graphql ./src/graphql

EXPOSE 3000

CMD ["pnpm", "start"]
