#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "==> Starting backend (Hasura applies migrations on boot)"
docker compose up -d postgres supertokens-db supertokens hasura auth-service leaflet-processing

echo "==> Seeding catalogue + flyers"
node scripts/seed-backend.mjs

echo "Done. Start frontend with: cd frontend && npm install && npm run dev"
echo "Set VITE_USE_MOCK_DATA=false in frontend/.env to use this API."
