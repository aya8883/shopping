/**
 * Generate frontend/src/data/weekly-offers.json from flyer-style OCR blocks
 * matched to the local product catalog. Works offline (no Hasura / no Docker).
 *
 * This is Stage 1 for PWA beta: Search / Basket use flyer-sourced prices
 * instead of purely synthetic catalog deltas.
 *
 * Usage: node scripts/generate-weekly-offers.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'frontend/src/data/catalog.ts');
const hotspotsPath = path.join(root, 'frontend/src/data/leafletHotspots.ts');
const sourcesPath = path.join(root, 'data/leaflet-sources.json');
const outPath = path.join(root, 'frontend/src/data/weekly-offers.json');

const STORE_BLOCKS = {
  carrefour: [
    { productName: 'Almarai Full Fat Milk', brand: 'Almarai', size: '2', unit: 'L', regularPrice: 12.95, offerPrice: 9.95, promotion: 'Weekly leaflet special' },
    { productName: 'Afia Sunflower Oil', brand: 'Afia', size: '1.5', unit: 'L', regularPrice: 29.95, offerPrice: 27.95, promotion: 'Pantry deal' },
    { productName: 'Basmati Rice', brand: 'Al Shalan', size: '10', unit: 'kg', regularPrice: 39.95, offerPrice: 34.95, promotion: 'Weekly offer' },
    { productName: 'Tide Automatic', brand: 'Tide', size: '5', unit: 'kg', regularPrice: 48, offerPrice: 41.5, promotion: 'Cleaning' },
    { productName: 'Signal Toothpaste', brand: 'Signal', size: '100', unit: 'g', regularPrice: 10.95, offerPrice: 8.75, promotion: 'Care' },
  ],
  lulu: [
    { productName: 'Almarai Full Fat Milk', brand: 'Almarai', size: '2', unit: 'L', regularPrice: 12.5, offerPrice: 10.5, promotion: 'Weekly leaflet special' },
    { productName: 'Noor Sunflower Oil', brand: 'Noor', size: '1.5', unit: 'L', regularPrice: 27.95, offerPrice: 23.5, promotion: 'Price drop' },
    { productName: 'Basmati Rice', brand: 'Al Shalan', size: '10', unit: 'kg', regularPrice: 41, offerPrice: 36.5, promotion: 'Weekly offer' },
    { productName: 'Signal Toothpaste', brand: 'Signal', size: '100', unit: 'g', regularPrice: 10.95, offerPrice: 9.25, promotion: 'Care deals' },
    { productName: 'Fresh Eggs', brand: 'Generic', size: '30', unit: 'piece', regularPrice: 24.95, offerPrice: 21.5, promotion: 'Fresh' },
  ],
};

STORE_BLOCKS.panda = STORE_BLOCKS.carrefour;
STORE_BLOCKS.danube = STORE_BLOCKS.lulu;
STORE_BLOCKS.tamimi = STORE_BLOCKS.carrefour;
STORE_BLOCKS.othaim = STORE_BLOCKS.lulu;

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(product, block) {
  const blob = normalize(
    [product.name_en, product.name_ar, product.brand_en, product.brand_ar].filter(Boolean).join(' '),
  );
  let score = 0;
  const name = normalize(block.productName);
  const brand = normalize(block.brand);
  if (name && blob.includes(name)) score += 40;
  else if (name) {
    for (const part of name.split(' ').filter((p) => p.length > 2)) {
      if (blob.includes(part)) score += 12;
    }
  }
  if (brand && blob.includes(brand)) score += 25;
  if (block.size && String(product.size_value ?? '') === String(block.size)) score += 10;
  if (block.unit && normalize(product.size_unit) === normalize(block.unit)) score += 8;
  return score;
}

function parseCatalogProducts(ts) {
  const products = [];
  const blocks = ts.split(/\{\s*\n\s*id: '/).slice(1);
  for (const block of blocks) {
    const id = block.match(/^([^']+)'/)?.[1];
    if (!id || !id.startsWith('4444')) continue;
    const name_en = block.match(/name_en: '([^']+)'/)?.[1];
    const name_ar = block.match(/name_ar: '([^']+)'/)?.[1];
    const size_value = Number(block.match(/size_value: ([0-9.]+)/)?.[1] ?? NaN);
    const size_unit = block.match(/size_unit: '([^']+)'/)?.[1];
    const brand_en = block.match(/brand: brands\.\w+[\s\S]*?name_en: '([^']+)'/)?.[1]
      ?? block.match(/brands\.(\w+)/)?.[1];
    // brand from brands.xxx reference — pull from known map below if needed
    const brandKey = block.match(/brand: brands\.(\w+)/)?.[1];
    products.push({
      id,
      name_en,
      name_ar,
      size_value: Number.isFinite(size_value) ? size_value : null,
      size_unit: size_unit ?? null,
      brand_en: brandKey ?? null,
      brand_ar: null,
    });
  }
  return products;
}

function parseCanonicalProducts(ts) {
  const products = [];
  const re =
    /\{\s*id: '([^']+)',\s*name_en: '([^']+)',\s*name_ar: '([^']+)'(?:,\s*brand_en: '([^']*)')?(?:,\s*brand_ar: '([^']*)')?,\s*size_value: ([0-9.]+),\s*size_unit: '([^']+)'/g;
  let m;
  while ((m = re.exec(ts))) {
    products.push({
      id: m[1],
      name_en: m[2],
      name_ar: m[3],
      brand_en: m[4] || null,
      brand_ar: m[5] || null,
      size_value: Number(m[6]),
      size_unit: m[7],
    });
  }
  return products;
}

function parseCanonicalPrices(ts) {
  // Lightweight: reuse CANONICAL_STORE_PRICES by evaluating via regex pairs
  const out = {};
  const productBlocks = [
    ...ts.matchAll(/'([a-z0-9-]+)':\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g),
  ];
  for (const [, productId, body] of productBlocks) {
    if (!productId.includes('-')) continue;
    if (productId.startsWith('4444')) continue;
    out[productId] = {};
    for (const sm of body.matchAll(/(\w+):\s*\{\s*price:\s*([0-9.]+)(?:,\s*oldPrice:\s*([0-9.]+|null))?/g)) {
      out[productId][sm[1]] = {
        offer_price: Number(sm[2]),
        regular_price: sm[3] && sm[3] !== 'null' ? Number(sm[3]) : null,
      };
    }
  }
  return out;
}

function thisWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const daysSinceSaturday = (day + 1) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

const catalogTs = await fs.readFile(catalogPath, 'utf8');
const hotspotsTs = await fs.readFile(hotspotsPath, 'utf8');
let sources = { stores: {} };
try {
  sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8'));
} catch {
  /* optional */
}

const catalog = [...parseCatalogProducts(catalogTs), ...parseCanonicalProducts(hotspotsTs)];
const canonicalPrices = parseCanonicalPrices(hotspotsTs);
const week = thisWeekRange();

const stores = {};
for (const slug of Object.keys(STORE_BLOCKS)) {
  const blocks = STORE_BLOCKS[slug];
  const offers = [];
  for (const block of blocks) {
    const ranked = catalog
      .map((p) => ({ p, score: scoreMatch(p, block) }))
      .filter((x) => x.score >= 20)
      .sort((a, b) => b.score - a.score);
    const best = ranked[0]?.p;
    if (!best) continue;
    offers.push({
      productId: best.id,
      offer_price: block.offerPrice,
      regular_price: block.regularPrice ?? null,
      promotion_en: block.promotion ?? 'Weekly offer',
      promotion_ar: 'عرض الأسبوع',
      matchScore: ranked[0].score,
      source: 'flyer_ocr',
    });
  }

  // Overlay curated hotspot prices for this store
  for (const [productId, byStore] of Object.entries(canonicalPrices)) {
    const quote = byStore[slug];
    if (!quote) continue;
    const existing = offers.findIndex((o) => o.productId === productId);
    const row = {
      productId,
      offer_price: quote.offer_price,
      regular_price: quote.regular_price,
      promotion_en: 'Weekly flyer',
      promotion_ar: 'نشرة الأسبوع',
      matchScore: 100,
      source: 'flyer_hotspot',
    };
    if (existing >= 0) offers[existing] = row;
    else offers.push(row);
  }

  const src = sources.stores?.[slug] ?? {};
  stores[slug] = {
    start_date: src.start_date ?? week.start,
    end_date: src.end_date ?? week.end,
    title_en: src.title_en ?? null,
    title_ar: src.title_ar ?? null,
    offers,
  };
  console.log(`${slug}: ${offers.length} offers`);
}

const payload = {
  syncedAt: new Date().toISOString(),
  source: 'weekly_flyer_stage1',
  attribution:
    'Flyer-sourced prices from OCR match + curated leaflet hotspots. Replace mock OCR with real vision OCR when ready.',
  stores,
};

await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`\nWrote ${outPath}`);
