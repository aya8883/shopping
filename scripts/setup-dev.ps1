# Local development setup for Windows (PowerShell)
# Prefer: npm run backend:up
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example"
}

Write-Host "==> Starting backend (Hasura applies migrations on boot)"
docker compose up -d postgres supertokens-db supertokens hasura auth-service leaflet-processing

Write-Host "==> Seeding catalogue + flyers"
node scripts/seed-backend.mjs

Write-Host "Done."
Write-Host "Frontend: cd frontend; npm install; npm run dev"
Write-Host "Set VITE_USE_MOCK_DATA=false in frontend/.env to use this API."
Write-Host "Hasura console: http://localhost:8080/console"
Write-Host "GraphQL: http://localhost:8080/v1/graphql"
