#!/bin/sh
set -e

# Ensure SQLite database directory exists
mkdir -p /app/prisma/data

echo "📦 Initializing database schema..."
npx prisma db push --skip-generate

echo "🌱 Ensuring initial seed data..."
npx tsx prisma/seed.ts || echo "Seed check complete"

echo "🚀 Starting arQuonCX production server on port ${PORT:-3001}..."
exec npx tsx server/src/index.ts
