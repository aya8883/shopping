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
| Every 6 hours | GitHub Actions / Windows task runs `npm run sync:all` (FullFlyer catalogs → manifests) |
| Daily | Open Admin → check Freshness panel; ingest stores marked missing/expired |
| Weekly | When new leaflets drop, run OCR + match + Publish for each supermarket |
| Later | Cron calls `POST /v1/freshness` and alerts Slack/email |

**Automatic leaflet sync** (discover + manifest):

```powershell
npm run sync:all
# GitHub: Actions → Sync weekly leaflets (cron every 6h)
# Local Windows: npm run schedule:sync
```

**Automatic OCR + ingest into Offers (recommended first stage)**

When both `functions/leaflet-processing` and Hasura are running, persist OCR+matches into:
`leaflets`, `leaflet_pages`, `supermarket_offers`.

```powershell
# Run once:
npm run ingest:leaflets

# Run together with the 6h sync job (Windows):
powershell -ExecutionPolicy Bypass -File ./scripts/schedule-sync-windows.ps1 -WithIngest
```

See [real-data.md](./real-data.md#run-every-6-hours-automatic).

Example health check (when processing service is running):

```powershell
curl http://localhost:3010/health
```

## Real weekly leaflet pages

Pull actual promotion sheet images from public FullFlyer/ilofo catalogs:

```powershell
npm run sync:real-data
```

This discovers the latest FullFlyer catalog per store, then writes `frontend/src/data/leaflet-manifest.json` with CDN page URLs. See also [real-data.md](./real-data.md).

Legacy sync only:

```powershell
npm run sync:leaflets
```

Optional — cache images locally:

```powershell
node scripts/sync-leaflets.mjs --download=true --pages=6
```

Or via the processing service (when running on `:3010`):

```powershell
curl "http://localhost:3010/v1/leaflets/fetch?pages=6"
```

Configured sources live in `data/leaflet-sources.json` (Carrefour, LuLu, Panda, Danube, Tamimi, Othaim).

## Path to real store data

1. Replace Mock OCR with Vision/Textract (`OCR_PROVIDER=...`)
2. Upload real PDF/page images to `storage/`
3. With Hasura up: extend `/v1/publish-payload` to insert `leaflets`, `leaflet_pages`, `supermarket_offers`
4. Set `VITE_USE_MOCK_DATA=false` so Offers reads from Hasura
5. Add per-store fetch adapters (official leaflet URLs / partners)

## Legal note

Prefer official leaflets you may display, partner APIs, or licensed feeds. Scraping can violate store ToS — use as last resort.
