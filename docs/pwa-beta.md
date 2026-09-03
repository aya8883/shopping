# PWA beta checklist — Wain Awfar

Goal: ship a **phone installable** Smart Basket beta using the existing Vite PWA (not App Store yet).

## What “beta ready” means

- Open on a phone over **HTTPS**
- Add to Home Screen (standalone)
- Journey works: Search → add → سلتي → قارن سلتي → savings
- Prices for key items come from **weekly flyer overlay** (`weekly-offers.json`), not only synthetic deltas

## Local verify

```powershell
cd frontend
npm run build
npm run preview
```

On your phone (same Wi‑Fi), open `http://<your-pc-ip>:4173` — install may require HTTPS in production.

Profile → **Install Wain Awfar** shows the install CTA when the browser supports it.

## Refresh flyer prices (Stage 1)

```powershell
npm run sync:all          # discover leaflets + regenerate weekly-offers.json
# or just:
npm run generate:offers
```

Then restart / rebuild the frontend so it picks up `frontend/src/data/weekly-offers.json`.

## Production deploy (required for proper install)

1. Merge `cursor/clickable-leaflet-hotspots` → `main`
2. Host the `frontend/dist` build on HTTPS (Vercel / Netlify / Cloudflare Pages / nginx)
3. Open the URL on a phone → Install / Add to Home Screen

## Not yet (next after beta)

- Real vision OCR (replace mock OCR blocks)
- Hasura-backed live offers (`VITE_USE_MOCK_DATA=false`)
- Capacitor / App Store packaging
- Distance-aware store recommendations
