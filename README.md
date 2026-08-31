# Wain Awfar — وين أوفر؟

Riyadh supermarket price comparison app (Phase 1–2 skeleton).

**Compare. Save. Shop smarter.** / **قارن. وفر. تسوق بذكاء.**

Built with the same overall stack style as AuditQ: React + Vite + TypeScript + Tailwind + MUI + SuperTokens + Hasura + PostgreSQL.

> Branding is configurable via `VITE_APP_NAME` / `VITE_APP_NAME_AR` — do not hardcode the product name in business logic.

## Architecture

```
React (Vite)  →  Apollo GraphQL  →  Hasura  →  PostgreSQL
                     ↑
               SuperTokens (auth-service)
```

Custom Node/TypeScript services under `functions/` are used only where Hasura CRUD is not enough (auth claims, leaflet OCR / ingest, later basket actions).

See [docs/leaflet-ingest.md](docs/leaflet-ingest.md) for weekly promotion ingest and freshness.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind, MUI, React Router, Apollo, i18next, PWA |
| Auth | SuperTokens (email/password) + Hasura JWT claims |
| API | Hasura GraphQL |
| DB | PostgreSQL 16 |
| Custom logic | Node.js / TypeScript (`functions/`) |

## Repository structure

```
project-root/
  docker-compose.yml
  .env.example
  frontend/               # Consumer + future admin (same app)
  hasura/
    migrations/
    metadata/
    seeds/
  functions/
    auth-service/         # SuperTokens backend + profile linking
    leaflet-processing/   # Mock OCR stubs (Phase 6)
  docs/
  scripts/
  storage/                # Local leaflet file storage placeholder
```

## Requirements

- Docker Desktop
- Node.js 20+ (for local frontend)
- Optional: Hasura CLI

## Environment variables

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Key variables are documented in `.env.example` (`POSTGRES_*`, `HASURA_*`, `SUPERTOKENS_*`, `VITE_*`).

Never put admin secrets or OCR/API keys in `VITE_*` variables.

## Local setup (Windows)

### 1. Start infrastructure + migrate + seed

```powershell
Copy-Item .env.example .env
.\scripts\setup-dev.ps1
```

Or step by step:

```powershell
docker compose up -d postgres supertokens-db supertokens hasura auth-service
# wait until http://localhost:8080/healthz is OK
Get-Content .\hasura\migrations\default\1740000000001_init\up.sql -Raw |
  docker compose exec -T postgres psql -U wain_awfar -d wain_awfar
Get-Content .\hasura\seeds\default\1740000000002_demo_seed.sql -Raw |
  docker compose exec -T postgres psql -U wain_awfar -d wain_awfar
```

Then apply Hasura metadata (tracks tables + permissions):

```powershell
docker run --rm --network host `
  -v "${PWD}/hasura:/hasura" -w /hasura `
  hasura/graphql-cli:v2.36.0 `
  metadata apply --endpoint http://host.docker.internal:8080 `
  --admin-secret wain_awfar_hasura_admin_secret_dev
```

If metadata CLI networking fails on Windows, open Hasura Console → Data → Track all tables from schema `public`, or import metadata from `hasura/metadata`.

### 2. Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Useful URLs

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Hasura Console | http://localhost:8080/console |
| GraphQL | http://localhost:8080/v1/graphql |
| Auth service | http://localhost:3001/health |
| SuperTokens Core | http://localhost:3567/hello |

Hasura admin secret (dev): `wain_awfar_hasura_admin_secret_dev`

## Phase 1–2 validation scenario

Seeded product: **Almarai Full Fat Milk 2L**

| Store | Regular | Offer | Unit |
| --- | --- | --- | --- |
| Carrefour | 12.95 | **9.95** | 4.975 SAR/L |
| LuLu | 12.50 | 10.50 | 5.25 SAR/L |

Expected UI: **Best price = Carrefour**, **You save = 0.55 SAR**.

Search for `Almarai` or `مراعي` on the home/search screens. Demo rows are flagged `is_demo = true`.

Basket seed prices (for later Phase 4 optimizeBasket) also exist for milk ×2, eggs 30, basmati 10kg, Afia oil 1.5L, Tide 5kg — mixed cheapest store.

## GraphQL example

```graphql
query {
  products(where: { name_en: { _ilike: "%Almarai Full Fat Milk%" } }) {
    name_en
    name_ar
    size_value
    size_unit
    offers(where: { active: { _eq: true } }) {
      offer_price
      regular_price
      supermarket { name_en name_ar slug }
    }
  }
}
```

Send header `x-hasura-admin-secret` in Console, or use anonymous role from the app (no JWT).

## Authentication

- Anonymous users can search and compare immediately.
- SuperTokens email/password is wired via `functions/auth-service`.
- On signup/signin, a `user_profiles` row is created and Hasura claims (`x-hasura-user-id`, roles) are attached to the session access token.
- Frontend uses `supertokens-auth-react` with header-based token transfer for Apollo (`Authorization: Bearer …`).

## OCR development mode

`functions/leaflet-processing` ships a `MockOCRProvider`. No cloud credentials are required for Phase 1–2.

## Tests

```powershell
cd frontend
npm test
```

Covers pricing (effective price, unit price, comparison) and Arabic/product normalization utilities.

## PWA / Capacitor

- `vite-plugin-pwa` is configured (manifest, offline shell, basic caching).
- Architecture stays web-first and Capacitor-compatible; native packaging is intentionally out of Phase 1–2.

## Implementation phases

| Phase | Status in this repo |
| --- | --- |
| 1 — Project, Docker, Hasura, SuperTokens, React | Done (skeleton) |
| 2 — Schema, seeds, search + comparison UI | Done (skeleton) |
| 3–10 — Lists, admin, OCR, matching, alerts, polish | Not started |

## Security notes

- Consumer roles never get unrestricted update/delete on catalogue tables.
- Admin secret stays server-side only.
- Uploaded leaflet validation lands with Phase 6 admin upload.

## License

Private / unpublished — all rights reserved unless otherwise noted.
