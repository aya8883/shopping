# Local development setup for Windows (PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example"
}

Write-Host "==> Starting infrastructure"
docker compose up -d postgres supertokens-db supertokens hasura auth-service

Write-Host "==> Waiting for Hasura healthz"
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    Invoke-WebRequest -Uri "http://localhost:8080/healthz" -UseBasicParsing | Out-Null
    $ready = $true
    break
  } catch {
    Start-Sleep -Seconds 2
  }
}
if (-not $ready) { throw "Hasura did not become healthy in time" }

$adminSecret = "wain_awfar_hasura_admin_secret_dev"
$hasuraDir = Join-Path $Root "hasura"
$projectNetwork = ((docker compose ps -q hasura | ForEach-Object { docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' $_ }) | Select-Object -First 1)
if (-not $projectNetwork) { $projectNetwork = "shopping_default" }

Write-Host "==> Applying SQL migration via postgres container"
$migrationSql = Get-Content (Join-Path $hasuraDir "migrations\default\1740000000001_init\up.sql") -Raw
$migrationSql | docker compose exec -T postgres psql -U wain_awfar -d wain_awfar

Write-Host "==> Applying seed data"
$seedSql = Get-Content (Join-Path $hasuraDir "seeds\default\1740000000002_demo_seed.sql") -Raw
$seedSql | docker compose exec -T postgres psql -U wain_awfar -d wain_awfar

Write-Host "==> Applying Hasura metadata (network: $projectNetwork)"
docker run --rm --network $projectNetwork `
  -v "${hasuraDir}:/hasura" `
  -w /hasura `
  hasura/graphql-cli:v2.36.0 `
  metadata apply --endpoint http://hasura:8080 --admin-secret $adminSecret

Write-Host "Done."
Write-Host "Frontend: cd frontend; npm install; npm run dev"
Write-Host "Hasura console: http://localhost:8080/console"
Write-Host "GraphQL: http://localhost:8080/v1/graphql"
