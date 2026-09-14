# Backend — Wain Awfar

Postgres + Hasura GraphQL + SuperTokens + auth-service + leaflet-processing.

This is the source of truth for products, offers, and weekly flyers. The GitHub Pages PWA still uses mock data until a hosted API exists.

## Services

| Service | Local URL | Role |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | Catalogue, offers, users |
| Hasura | http://localhost:8080 | GraphQL API + permissions |
| SuperTokens | http://localhost:3567 | Session core |
| Auth service | http://localhost:3001 | Email/password + Hasura JWT claims |
| Leaflet processing | http://localhost:3010 | Flyer fetch + mock OCR |

Anonymous GraphQL reads work without login (`unauthorized role = anonymous`).

## Start locally

Docker Desktop must be running.

```powershell
npm run backend:up
```

That command:

1. Starts the containers
2. Hasura applies SQL migrations + metadata on boot
3. Seeds stores, products, flyer pages, and weekly offer prices

Health checks:

```powershell
curl http://localhost:8080/healthz
curl http://localhost:3001/health
curl http://localhost:3010/health
```

## Point the app at the backend

In `frontend/.env`:

```
VITE_USE_MOCK_DATA=false
VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
VITE_SUPERTOKENS_API_DOMAIN=http://localhost:3001
VITE_WEBSITE_DOMAIN=http://localhost:5173
```

Then `npm run dev:frontend`.

## Refresh flyer data into the database

After `npm run sync:all` (updates JSON files):

```powershell
npm run backend:seed
```

Or ingest through the leaflet service (needs the service + Hasura):

```powershell
npm run ingest:leaflets
```

## Production-style compose

Hides the Hasura console, uses the auth production image, and does not publish Postgres/SuperTokens ports:

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres supertokens-db supertokens hasura auth-service leaflet-processing
npm run backend:seed
```

Replace secrets in `.env` before any public deploy:

- `POSTGRES_PASSWORD`
- `HASURA_GRAPHQL_ADMIN_SECRET`
- `SUPERTOKENS_POSTGRES_PASSWORD`
- `AUTH_SERVICE_CORS_ORIGIN` / `HASURA_GRAPHQL_CORS_DOMAIN` (your HTTPS frontend origin)
- `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` when the API and site are on different domains

## Still later (not this step)

- Hosted Postgres/Hasura (Fly, Render, Neon, Hasura Cloud)
- Real OCR instead of mock blocks
- Wire GitHub Pages `VITE_HASURA_GRAPHQL_URL` to the hosted API
