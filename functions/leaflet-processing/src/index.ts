import express from 'express';
import cors from 'cors';
import { createOCRProvider } from './ocr.js';
import { matchOfferBlocks, type CatalogProduct } from './match.js';
import { checkFreshness } from './freshness.js';

const app = express();
const port = Number(process.env.LEAFLET_SERVICE_PORT ?? 3010);
const ocr = createOCRProvider();

app.use(cors({ origin: process.env.AUTH_SERVICE_CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, ocr: process.env.OCR_PROVIDER ?? 'mock' });
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

    const blocks =
      supermarketSlug === 'lulu' || supermarketSlug === 'carrefour'
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

/**
 * Placeholder for Hasura admin publish. When HASURA_GRAPHQL_ADMIN_SECRET + URL
 * are set, a future step can insert leaflets/offers via GraphQL. For now returns
 * the payload the admin UI (or a job) should persist.
 */
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
