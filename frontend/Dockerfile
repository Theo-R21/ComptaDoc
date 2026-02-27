# ── Stage 1 : dépendances ─────────────────────────────────────────────────
FROM node:22-slim AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
RUN npm rebuild lightningcss --platform=linux --arch=x64 || true

# ── Stage 2 : builder (next build) ────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3 : prod (image finale légère) ──────────────────────────────────
FROM node:22-slim AS prod

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# On ne copie que le strict nécessaire pour next start
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

# ── Stage 4 : dev (hot reload) ────────────────────────────────────────────
FROM node:22-slim AS dev

WORKDIR /app

ENV NODE_ENV=development
ENV WATCHPACK_POLL=true
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=500
ENV NEXT_PRIVATE_POLL_INTERVAL=500

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]