# syntax=docker/dockerfile:1

# --- Build stage ----------------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL is not required at build time (only prisma generate runs)
RUN npm run build

# --- Runtime stage --------------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Docker bridge networks often advertise IPv6 without routing it, which makes
# Node's fetch hang/fail on hosts with AAAA records (like api.opendota.com).
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Sync the schema on boot (idempotent), then start the server.
CMD ["sh", "-c", "node_modules/.bin/prisma db push --skip-generate && node_modules/.bin/next start"]
