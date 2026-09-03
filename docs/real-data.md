# Real supermarket data — what we can (and cannot) pull today

Wain Awfar needs **real prices** and **real weekly promotions**. Here is the honest picture for Saudi supermarkets in 2026.

## What “real” means in practice

| Data type | Official source | Feasible today? | How we get it |
|-----------|-----------------|-----------------|---------------|
| Weekly flyer **images** | Store PDFs / promotion pages | **Yes** | FullFlyer → ilofo CDN (same sheets stores publish) |
| Flyer **product + price** rows | Printed on flyer | **Partial** | OCR + human review (`/admin/leaflets`, hotspots) |
| Full **online catalog** prices | carrefourksa.com, luluhypermarket.com, etc. | **No (without partnership)** | Sites use Cloudflare / JS apps; no public API |

We probed official sites in development:

- **Carrefour KSA** — HTML loads; product JSON is client-side only (no usable public search API).
- **Panda** — `panda.com.sa` returns **429** (rate limit / bot block) from scripts.
- **LuLu** — **403 Cloudflare** on API routes.
- **Danube** — `/en/offers` returns 404; site structure changed.

So: **weekly flyer images are the most reliable “real” data** without a retailer agreement.

## What we sync automatically

Official store websites (Carrefour, LuLu, Panda, …) block bots. The reliable public source is **weekly flyer catalogs** on FullFlyer → ilofo CDN (same sheets the stores publish).

```powershell
# Discover latest catalogs + refresh leaflet manifests
npm run sync:all

# Same as above (alias)
npm run sync:real-data

# Optional: also refresh product category images
node scripts/sync-all.mjs --images
```

This updates:

- `data/leaflet-sources.json` — latest `fullflyerUrl`, dates, titles
- `frontend/src/data/leaflet-manifest.json` — page image URLs used on **Offers**

Each store entry also keeps `officialUrl` (link to the retailer’s own promotions page).

## Run every 6 hours (automatic)

### Option A — GitHub Actions (recommended for the repo)

Workflow: [`.github/workflows/sync-leaflets.yml`](../.github/workflows/sync-leaflets.yml)

- **Schedule:** `0 */6 * * *` (every 6 hours UTC)
- **Manual:** GitHub → **Actions** → **Sync weekly leaflets** → **Run workflow**
- On change, it commits updated manifests back to the branch

Requires Actions enabled on the repo and write permission for `GITHUB_TOKEN` (default `contents: write` in the workflow).

### Option B — Windows Task Scheduler (this PC)

```powershell
# Register a task that runs every 6 hours and logs to logs/sync-leaflets.log
npm run schedule:sync

# Or with product images on each run:
powershell -ExecutionPolicy Bypass -File .\scripts\schedule-sync-windows.ps1 -WithImages

# Run once now / remove later:
Start-ScheduledTask -TaskName WainAwfar-SyncLeaflets
powershell -File .\scripts\schedule-sync-windows.ps1 -Unregister
```

Your PC must be on (and you logged in) for Interactive tasks. For unattended servers, prefer GitHub Actions or a Linux cron/`systemd` timer calling `node scripts/sync-all.mjs`.

### Option C — Linux cron

```cron
0 */6 * * * cd /path/to/shopping && /usr/bin/node scripts/sync-all.mjs >> logs/sync-leaflets.log 2>&1
```

### Panda note

FullFlyer’s Panda listing (`bndh`) is often **out of date**. For Panda we also support a manual override in `leaflet-sources.json` (e.g. current week from [3orod.net](https://3orod.net)).

## Making prices real (roadmap)

1. **Now — flyer-backed offers**  
   Admin annotates hotspots or runs OCR → publish matched lines to Offers.

2. **Next — OCR pipeline**  
   `functions/leaflet-processing` → vision on synced page images → canonical product match.

3. **Production — retailer feeds**  
   Partner API / SFTP / approved scraper with Carrefour MAF, LuLu Akinon, etc.  
   This is what apps like grocery comparators use at scale.

4. **Legal**  
   Check each retailer’s Terms of Service before automated scraping. FullFlyer/ilofo hosts **public** catalog images; live e-commerce prices usually require permission.

## Verify freshness

```powershell
cd frontend && npm run dev
```

Open **Offers** → each store tab should show the synced flyer. Check `leaflet-manifest.json` → `syncedAt`.

## Files

| Path | Role |
|------|------|
| `data/leaflet-sources.json` | Store URLs + optional Panda override pages |
| `scripts/discover-leaflet-catalogs.mjs` | Auto-pick latest FullFlyer catalog per store |
| `scripts/sync-leaflets.mjs` | Fetch page images → manifest |
| `frontend/src/data/catalog.ts` | Demo product grid (synthetic cross-store prices until feeds exist) |

Until retailer feeds are wired, treat **catalog.ts prices as illustrative** and **flyer/hotspot prices as the real promotion layer**.
