import express from 'express';
import cors from 'cors';
import { createOCRProvider } from './ocr.js';
import { matchOfferBlocks, type CatalogProduct } from './match.js';
import { checkFreshness } from './freshness.js';
import { fetchFullFlyerCatalog, sliceCatalogPages } from './fetch/fullflyer.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcesPath = path.resolve(__dirname, '../../../data/leaflet-sources.json');

const app = express();
const port = Number(process.env.LEAFLET_SERVICE_PORT ?? 3010);
const ocr = createOCRProvider();

app.use(cors({ origin: process.env.AUTH_SERVICE_CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, ocr: process.env.OCR_PROVIDER ?? 'mock' });
});

/**
 * Fetch real weekly leaflet pages from configured FullFlyer catalog URLs.
 * Optional ?slug=carrefour to fetch one store; otherwise all stores in leaflet-sources.json.
 */
app.get('/v1/leaflets/fetch', async (req, res) => {
  try {
    const slugFilter = typeof req.query.slug === 'string' ? req.query.slug : null;
    const maxPages = Number(req.query.pages ?? 6);
    const raw = await fs.readFile(sourcesPath, 'utf8');
    const sources = JSON.parse(raw) as {
      attribution?: string;
      stores: Record<string, { fullflyerUrl: string; officialUrl?: string; title_en?: string; title_ar?: string }>;
    };

    const entries = Object.entries(sources.stores).filter(([slug]) => !slugFilter || slug === slugFilter);
    const results: Record<string, unknown> = {};

    for (const [slug, cfg] of entries) {
      try {
        const catalog = await fetchFullFlyerCatalog(cfg.fullflyerUrl);
        results[slug] = {
          ...cfg,
          catalog_id: catalog.catalog_id,
          start_date: catalog.start_date,
          end_date: catalog.end_date,
          title_en: cfg.title_en ?? catalog.title_en,
          page_count: catalog.page_count,
          pages: sliceCatalogPages(catalog, maxPages),
        };
      } catch (err) {
        results[slug] = { ...cfg, error: String(err) };
      }
    }

    res.json({
      fetchedAt: new Date().toISOString(),
      attribution: sources.attribution,
      stores: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'leaflet_fetch_failed' });
  }
});

/**
 * Run OCR + product matching. Catalog should be passed from the caller
 * (frontend or Hasura query) so the service stays DB-agnostic in Phase A.
 */
app.post('/v1/ingest', async (req, res) => {
  try {
    const {
      supermarketSlug = 'carrefour',
      fileUrl = '',
      catalog = [],
      startDate,
      endDate,
    } = req.body as {
      supermarketSlug?: string;
      fileUrl?: string;
      catalog?: CatalogProduct[];
      startDate?: string;
      endDate?: string;
    };

    const knownStores = ['carrefour', 'lulu', 'panda', 'danube', 'tamimi', 'othaim'];
    const blocks =
      knownStores.includes(supermarketSlug)
        ? await ocr.extractOfferBlocksForStore(supermarketSlug)
        : await ocr.extractOfferBlocks({ fileUrl });

    const matches = matchOfferBlocks(blocks, catalog);
    res.json({
      supermarketSlug,
      startDate,
      endDate,
      processedAt: new Date().toISOString(),
      blocks,
      matches,
      matchedCount: matches.filter((m) => m.product).length,
      unmatchedCount: matches.filter((m) => !m.product).length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ingest_failed' });
  }
});

app.post('/v1/freshness', (req, res) => {
  const { stores = [], leaflets = [], today } = req.body as {
    stores?: Array<{ slug: string; name_en: string; id: string }>;
    leaflets?: Array<{
      supermarket: { id: string; slug: string };
      end_date: string;
      offers?: unknown[];
    }>;
    today?: string;
  };
  res.json(checkFreshness(stores, leaflets, today));
});

app.post('/v1/publish-payload', (req, res) => {
  res.json({
    mode: process.env.HASURA_GRAPHQL_ADMIN_SECRET ? 'hasura-ready' : 'local-only',
    received: req.body,
    hint: 'Persist via admin UI localStorage overlay or Hasura mutations when Docker is up.',
  });
});

app.listen(port, () => {
  console.log(`Leaflet processing listening on :${port}`);
});
