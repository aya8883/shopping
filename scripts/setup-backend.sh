#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "==> Starting backend services"
docker compose up -d postgres supertokens-db supertokens hasura auth-service leaflet-processing

echo "==> Seeding catalog + weekly flyers into Hasura"
node scripts/seed-backend.mjs

echo
echo "Backend ready."
echo "  Hasura health : http://localhost:8080/healthz"
echo "  GraphQL       : http://localhost:8080/v1/graphql"
echo "  Auth health   : http://localhost:3001/health"
echo "  Leaflets      : http://localhost:3010/health"
echo
echo "In frontend/.env set VITE_USE_MOCK_DATA=false then npm run dev:frontend"
