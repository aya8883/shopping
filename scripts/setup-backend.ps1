# Local backend bring-up (Postgres + Hasura + SuperTokens + auth + leaflet service)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example"
}

Write-Host "==> Starting backend services"
docker compose up -d postgres supertokens-db supertokens hasura auth-service leaflet-processing

Write-Host "==> Seeding catalog + weekly flyers into Hasura"
node scripts/seed-backend.mjs

Write-Host ""
Write-Host "Backend ready."
Write-Host "  Hasura health : http://localhost:8080/healthz"
Write-Host "  GraphQL       : http://localhost:8080/v1/graphql"
Write-Host "  Console       : http://localhost:8080/console"
Write-Host "  Auth health   : http://localhost:3001/health"
Write-Host "  Leaflets      : http://localhost:3010/health"
Write-Host ""
Write-Host "Point the frontend at this API:"
Write-Host "  In frontend/.env set VITE_USE_MOCK_DATA=false"
Write-Host "  VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql"
Write-Host "  Then: npm run dev:frontend"
