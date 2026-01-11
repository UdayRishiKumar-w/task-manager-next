FROM node:24-alpine AS base
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm,id=npm-cache-ptm,sharing=locked npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run codegen && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Ensure runtime has access to graphql schema files required by server code
COPY --from=builder /app/src/graphql ./src/graphql
EXPOSE 3000
CMD ["npm", "start"]
