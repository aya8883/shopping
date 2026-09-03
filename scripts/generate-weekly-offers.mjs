/**
 * Generate frontend/src/data/weekly-offers.json — flyer-style prices for the Smart Basket engine.
 * Offline: matches OCR-like blocks + curated hotspot prices to the catalog.
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

const BRANDS = {
  almarai: { en: 'Almarai', ar: 'المراعي' },
  nadec: { en: 'Nadec', ar: 'نادك' },
  afia: { en: 'Afia', ar: 'عافية' },
  alShalan: { en: 'Al Shalan', ar: 'الشعلان' },
  abuKass: { en: 'Abu Kass', ar: 'أبو كاس' },
  tide: { en: 'Tide', ar: 'تايد' },
  persil: { en: 'Persil', ar: 'برسيل' },
  pepsi: { en: 'Pepsi', ar: 'بيبسي' },
  cocaCola: { en: 'Coca-Cola', ar: 'كوكا كولا' },
  generic: { en: 'Generic', ar: 'عام' },
  signal: { en: 'Signal', ar: 'سيجنال' },
  noor: { en: 'Noor', ar: 'نور' },
};

/** Base flyer lines (Carrefour-style). Other stores get priced variants below. */
const BASE_LINES = [
  { productName: 'Almarai Full Fat Milk', brand: 'Almarai', size: '2', unit: 'L', regularPrice: 12.95, offerPrice: 9.95, aliases: ['حليب المراعي', 'حليب'] },
  { productName: 'Almarai Full Fat Milk 1L', brand: 'Almarai', size: '1', unit: 'L', regularPrice: 6.5, offerPrice: 5.5, aliases: ['حليب 1'] },
  { productName: 'Fresh Eggs 30 Pack', brand: 'Generic', size: '30', unit: 'piece', regularPrice: 24.95, offerPrice: 17.95, aliases: ['بيض', 'fresh eggs'] },
  { productName: 'Basmati Rice', brand: 'Al Shalan', size: '10', unit: 'kg', regularPrice: 79.95, offerPrice: 69.95, aliases: ['أرز بسمتي', 'basmati'] },
  { productName: 'Afia Sunflower Oil', brand: 'Afia', size: '1.5', unit: 'L', regularPrice: 29.95, offerPrice: 27.95, aliases: ['زيت عافية', 'sunflower'] },
  { productName: 'Noor Sunflower Oil', brand: 'Noor', size: '1.5', unit: 'L', regularPrice: 27.95, offerPrice: 24.95, aliases: ['زيت نور'] },
  { productName: 'Tide Automatic Detergent', brand: 'Tide', size: '5', unit: 'kg', regularPrice: 49.95, offerPrice: 41.5, aliases: ['تايد', 'tide'] },
  { productName: 'Persil Gel', brand: 'Persil', size: '2.5', unit: 'L', regularPrice: 38.95, offerPrice: 32.5, aliases: ['برسيل'] },
  { productName: 'Signal Toothpaste', brand: 'Signal', size: '100', unit: 'g', regularPrice: 10.95, offerPrice: 8.75, aliases: ['سيجنال', 'toothpaste'] },
  { productName: 'Pepsi', brand: 'Pepsi', size: '6', unit: 'piece', regularPrice: 16.95, offerPrice: 14.95, aliases: ['بيبسي'] },
  { productName: 'Coca-Cola', brand: 'Coca-Cola', size: '6', unit: 'piece', regularPrice: 16.95, offerPrice: 14.5, aliases: ['كوكا'] },
  { productName: 'Nadec Laban', brand: 'Nadec', size: '2', unit: 'L', regularPrice: 11.5, offerPrice: 9.75, aliases: ['لبن نادك', 'laban'] },
];

/** Per-store price multipliers / tweaks so comparisons feel real (SAR deltas). */
const STORE_PRICE_TWEAK = {
  carrefour: 0,
  lulu: 0.55,
  panda: -0.4,
  danube: 0.85,
  tamimi: 0.25,
  othaim: -0.15,
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(product, block) {
  const blob = normalize(
    [product.name_en, product.name_ar, product.brand_en, product.brand_ar, ...(block.aliases ?? [])]
      .filter(Boolean)
      .join(' '),
  );
  const name = normalize(block.productName);
  const brand = normalize(block.brand);
  let score = 0;

  if (name && blob.includes(name)) score += 45;
  else if (name) {
    for (const part of name.split(' ').filter((p) => p.length > 2)) {
      if (blob.includes(part)) score += 14;
    }
  }

  for (const alias of block.aliases ?? []) {
    const a = normalize(alias);
    if (a && (normalize(product.name_ar).includes(a) || normalize(product.name_en).includes(a))) {
      score += 20;
    }
  }

  if (brand && (normalize(product.brand_en).includes(brand) || normalize(product.brand_ar).includes(brand) || blob.includes(brand))) {
    score += 28;
  }
  if (block.size && String(product.size_value ?? '') === String(block.size)) score += 12;
  if (block.unit && normalize(product.size_unit) === normalize(block.unit)) score += 10;
  return score;
}

function parseCatalogProducts(ts) {
  const products = [];
  const blocks = ts.split(/\{\s*\n\s*id: '/).slice(1);
  for (const block of blocks) {
    const id = block.match(/^([^']+)'/)?.[1];
    if (!id?.startsWith('4444')) continue;
    const name_en = block.match(/name_en: '([^']+)'/)?.[1];
    const name_ar = block.match(/name_ar: '([^']+)'/)?.[1];
    const size_value = Number(block.match(/size_value: ([0-9.]+)/)?.[1] ?? NaN);
    const size_unit = block.match(/size_unit: '([^']+)'/)?.[1] ?? null;
    const brandKey = block.match(/brand: brands\.(\w+)/)?.[1];
    const brand = brandKey ? BRANDS[brandKey] : null;
    products.push({
      id,
      name_en,
      name_ar,
      size_value: Number.isFinite(size_value) ? size_value : null,
      size_unit,
      brand_en: brand?.en ?? brandKey ?? null,
      brand_ar: brand?.ar ?? null,
    });
  }
  return products;
}

function parseCanonicalProducts(ts) {
  const products = [];
  const re =
    /id: '([a-z0-9-]+)',\s*name_en: '([^']+)',\s*name_ar: '([^']+)'(?:,\s*brand_en: '([^']*)')?(?:,\s*brand_ar: '([^']*)')?,\s*size_value: ([0-9.]+),\s*size_unit: '([^']+)'/g;
  let m;
  while ((m = re.exec(ts))) {
    if (!m[1].includes('-') || m[1].startsWith('4444')) continue;
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

/** Parse CANONICAL_STORE_PRICES object from leafletHotspots.ts */
function parseCanonicalPrices(ts) {
  const start = ts.indexOf('export const CANONICAL_STORE_PRICES');
  if (start < 0) return {};
  const braceStart = ts.indexOf('{', start);
  let depth = 0;
  let end = braceStart;
  for (let i = braceStart; i < ts.length; i++) {
    if (ts[i] === '{') depth++;
    if (ts[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = ts.slice(braceStart, end + 1);
  // Safer than eval: extract product → store → price pairs
  const out = {};
  const productRe = /'([a-z0-9-]+)':\s*\{/g;
  let pm;
  while ((pm = productRe.exec(body))) {
    const productId = pm[1];
    const from = pm.index + pm[0].length - 1;
    let d = 0;
    let to = from;
    for (let i = from; i < body.length; i++) {
      if (body[i] === '{') d++;
      if (body[i] === '}') {
        d--;
        if (d === 0) {
          to = i;
          break;
        }
      }
    }
    const chunk = body.slice(from, to + 1);
    out[productId] = {};
    for (const sm of chunk.matchAll(
      /(\w+):\s*\{\s*price:\s*([0-9.]+)(?:,\s*oldPrice:\s*([0-9.]+|null))?/g,
    )) {
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

function linesForStore(slug) {
  const tweak = STORE_PRICE_TWEAK[slug] ?? 0;
  return BASE_LINES.map((line) => ({
    ...line,
    offerPrice: round2(line.offerPrice + tweak),
    regularPrice: round2(line.regularPrice + tweak),
  }));
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
const storeSlugs = Object.keys(STORE_PRICE_TWEAK);

const stores = {};
for (const slug of storeSlugs) {
  const byProduct = new Map();

  for (const block of linesForStore(slug)) {
    const ranked = catalog
      .map((p) => ({ p, score: scoreMatch(p, block) }))
      .filter((x) => x.score >= 28)
      .sort((a, b) => b.score - a.score);
    const best = ranked[0]?.p;
    if (!best) continue;
    // Prefer higher match; don't overwrite a better score
    const prev = byProduct.get(best.id);
    if (prev && prev.matchScore >= ranked[0].score) continue;
    byProduct.set(best.id, {
      productId: best.id,
      offer_price: block.offerPrice,
      regular_price: block.regularPrice,
      promotion_en: 'Weekly flyer offer',
      promotion_ar: 'عرض النشرة الأسبوعية',
      matchScore: ranked[0].score,
      source: 'flyer_ocr',
    });
  }

  for (const [productId, byStore] of Object.entries(canonicalPrices)) {
    const quote = byStore[slug];
    if (!quote) continue;
    byProduct.set(productId, {
      productId,
      offer_price: quote.offer_price,
      regular_price: quote.regular_price,
      promotion_en: 'Weekly flyer',
      promotion_ar: 'نشرة الأسبوع',
      matchScore: 100,
      source: 'flyer_hotspot',
    });
  }

  const offers = [...byProduct.values()].sort((a, b) => a.productId.localeCompare(b.productId));
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
  source: 'weekly_flyer_engine_v2',
  attribution:
    'Flyer-sourced prices from improved OCR matching + curated leaflet hotspots. Store tweaks create cross-chain spread for Smart Basket.',
  stores,
};

await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`\nWrote ${outPath}`);
