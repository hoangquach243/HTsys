# --- Base Node ---
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Builder ---
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web api --docker

# --- Installer ---
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

# Generate Prisma client before building
RUN cd apps/api && npx prisma generate

# Build turbo packages
RUN npx turbo run build --filter=web... --filter=api...

# --- Runner (API) ---
FROM base AS runner-api
WORKDIR /app
COPY --from=installer /app/apps/api/dist ./dist
COPY --from=installer /app/apps/api/package.json .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main"]

# --- Runner (WEB) ---
FROM base AS runner-web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=installer /app/apps/web/next.config.mjs .
COPY --from=installer /app/apps/web/package.json .
COPY --from=installer /app/apps/web/public ./public
COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
