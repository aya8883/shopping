# Leaflet ingest & freshness

How Wain Awfar stays up to date with real weekly promotions.

## What we built (Phase A)

1. **Admin UI** — `/admin/leaflets` (also linked from Profile)
   - Pick supermarket + week dates
   - **Run OCR + match** (Mock OCR reads demo leaflet lines)
   - Review matched products / prices
   - **Publish to Offers** (browser overlay → Offers page updates immediately)

2. **Pipeline utilities** — `frontend/src/utils/leafletPipeline.ts`
   - Mock OCR blocks per store
   - Product matching
   - Local publish store (`localStorage`)
   - Freshness report (missing / expired leaflets)

3. **Leaflet processing service** — `functions/leaflet-processing`
   - `GET /health`
   - `POST /v1/ingest` — OCR + match (pass catalog in body)
   - `POST /v1/freshness` — store freshness check
   - `POST /v1/publish-payload` — stub for Hasura admin publish

## How to use (demo / no Docker)

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173/admin/leaflets → Run OCR + match → Publish → open **Offers**.

## How to run the processing service

```powershell
cd functions/leaflet-processing
npm install
npm run dev
```

Service listens on `http://localhost:3010`.

## Keeping data fresh (ops)

| Cadence | Action |
| --- | --- |
| Daily | Open Admin → check Freshness panel; ingest stores marked missing/expired |
| Weekly | When new leaflets drop, run OCR + match + Publish for each supermarket |
| Later | Cron calls `POST /v1/freshness` and alerts Slack/email |

Example daily check (when service is running):

```powershell
curl http://localhost:3010/health
```

## Path to real store data

1. Replace Mock OCR with Vision/Textract (`OCR_PROVIDER=...`)
2. Upload real PDF/page images to `storage/`
3. With Hasura up: extend `/v1/publish-payload` to insert `leaflets`, `leaflet_pages`, `supermarket_offers`
4. Set `VITE_USE_MOCK_DATA=false` so Offers reads from Hasura
5. Add per-store fetch adapters (official leaflet URLs / partners)

## Legal note

Prefer official leaflets you may display, partner APIs, or licensed feeds. Scraping can violate store ToS — use as last resort.
