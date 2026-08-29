#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "==> Starting infrastructure (postgres, hasura, supertokens, auth-service)"
docker compose up -d postgres supertokens-db supertokens hasura auth-service

echo "==> Waiting for Hasura..."
until curl -sf http://localhost:8080/healthz >/dev/null; do
  sleep 2
done

echo "==> Applying migrations"
docker run --rm --network shopping_default \
  -v "$ROOT/hasura:/hasura" \
  -e HASURA_GRAPHQL_ADMIN_SECRET=wain_awfar_hasura_admin_secret_dev \
  hasura/graphql-engine:v2.42.0 \
  /bin/sh -c "echo 'Use hasura-cli container instead'"

docker run --rm --network host \
  -v "$ROOT/hasura:/hasura" \
  -w /hasura \
  hasura/graphql-cli:v2.36.0 \
  migrate apply --database-name default --endpoint http://localhost:8080 --admin-secret wain_awfar_hasura_admin_secret_dev

echo "==> Applying metadata"
docker run --rm --network host \
  -v "$ROOT/hasura:/hasura" \
  -w /hasura \
  hasura/graphql-cli:v2.36.0 \
  metadata apply --endpoint http://localhost:8080 --admin-secret wain_awfar_hasura_admin_secret_dev

echo "==> Seeding demo data"
docker run --rm --network host \
  -v "$ROOT/hasura:/hasura" \
  -w /hasura \
  hasura/graphql-cli:v2.36.0 \
  seed apply --database-name default --endpoint http://localhost:8080 --admin-secret wain_awfar_hasura_admin_secret_dev

echo "Done. Start frontend with: cd frontend && npm install && npm run dev"
