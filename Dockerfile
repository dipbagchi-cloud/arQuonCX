# ====================================================================
# arQuonCX — Production Multi-stage Dockerfile
# ====================================================================

# --------------------------------------------------------------------
# Stage 1: Build Frontend & Prepare Prisma Client
# --------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma engines on Alpine)
RUN apk add --no-cache openssl

# Install all dependencies (cached layer)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and config files
COPY . .

# Build React 19 Frontend bundle to /dist
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production Runtime
# --------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime utilities
RUN apk add --no-cache openssl wget curl

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:/app/prisma/data/dev.db"

# Copy package manifests, Prisma schema, and node_modules from builder
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled frontend assets from builder
COPY --from=builder /app/dist ./dist

# Copy backend server code, TypeScript sources, and configs
COPY server ./server
COPY src ./src
COPY tsconfig*.json ./
COPY entrypoint.sh ./entrypoint.sh

# Ensure execute permissions on startup script
RUN chmod +x ./entrypoint.sh

# Ensure SQLite storage directory exists
RUN mkdir -p /app/prisma/data

EXPOSE 3001

# Container healthcheck monitoring /health endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:3001/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
