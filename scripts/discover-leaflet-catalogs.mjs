/**
 * Discover the latest weekly catalog URL per supermarket from FullFlyer listings.
 * These catalogs mirror the promotion PDFs retailers publish (ilofo CDN).
 *
 * Usage: node scripts/discover-leaflet-catalogs.mjs [--write]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourcesPath = path.join(root, 'data/leaflet-sources.json');

const write = process.argv.includes('--write');

const LISTINGS = {
  carrefour: { path: 'carrefour', listing: 'https://www.fullflyer.com/sa-en-offers/carrefour/catalogs' },
  lulu: { path: 'lulu', listing: 'https://www.fullflyer.com/sa-en-offers/lulu/catalogs' },
  panda: { path: 'bndh', listing: 'https://www.fullflyer.com/sa-en-offers/bndh/catalogs' },
  danube: { path: 'danube', listing: 'https://www.fullflyer.com/sa-en-offers/danube/catalogs' },
  tamimi: { path: 'tamimi-markets', listing: 'https://www.fullflyer.com/sa-en-offers/tamimi-markets/catalogs' },
  othaim: { path: 'othaim-markets', listing: 'https://www.fullflyer.com/sa-en-offers/othaim-markets/catalogs' },
};

const OFFICIAL_URLS = {
  carrefour: 'https://www.carrefourksa.com/mafsau/en/c/Offers',
  lulu: 'https://www.luluhypermarket.com/en-sa/promotions',
  panda: 'https://www.panda.com.sa/en/offers',
  danube: 'https://www.danube.sa/en/offers',
  tamimi: 'https://www.tamimimarkets.com/',
  othaim: 'https://www.othaimmarkets.com/',
};

function parseDisplayDate(raw) {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'WainAwfar/1.0 catalog-discovery' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function catalogIdsFromListing(html, listingPath) {
  const re = new RegExp(`${listingPath}/catalogs/(\\d+)-pdf`, 'gi');
  return [...new Set([...html.matchAll(re)].map((m) => m[1]))];
}

async function inspectCatalog(listingPath, catalogId) {
  const url = `https://www.fullflyer.com/sa-en-offers/${listingPath}/catalogs/${catalogId}-pdf`;
  const html = await fetchHtml(url);
  const title = html.match(/<h1[^>]*>([^<]+)/i)?.[1]?.trim() ?? '';
  const startRaw = html.match(/Start date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  const endRaw = html.match(/End date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  const pageMatches = [...html.matchAll(new RegExp(`catalogs/img/${catalogId}/[^"'\\s]+-(\\d+)\\.(?:jpg|jpeg|png|webp)`, 'gi'))];
  const pageCount = new Set(pageMatches.map((m) => m[1])).size;
  const start_date = startRaw ? parseDisplayDate(startRaw) : undefined;
  const end_date = endRaw ? parseDisplayDate(endRaw) : undefined;

  return {
    catalog_id: catalogId,
    fullflyerUrl: url,
    title_en: title.replace(/\s+/g, ' '),
    start_date,
    end_date,
    page_count: pageCount,
    is_bidder: /bidder/i.test(title),
  };
}

function scoreCatalog(c, today) {
  if (c.is_bidder || c.page_count < 3) return -1;
  let score = c.page_count * 2;
  if (/cash\s*&\s*carry/i.test(c.title_en)) score -= 300;
  if (c.start_date && c.end_date) {
    if (c.start_date <= today && c.end_date >= today) score += 1000;
    else if (c.end_date >= today) score += 200;
    else score -= 50;
  }
  return score;
}

async function discoverStore(slug, { path: listingPath, listing }) {
  const html = await fetchHtml(listing);
  const ids = catalogIdsFromListing(html, listingPath).slice(0, 12);
  if (!ids.length) throw new Error('no_catalogs_on_listing');

  const today = new Date().toISOString().slice(0, 10);
  const inspected = [];
  for (const id of ids) {
    try {
      inspected.push(await inspectCatalog(listingPath, id));
    } catch {
      /* skip */
    }
  }

  const ranked = inspected
    .map((c) => ({ ...c, score: scoreCatalog(c, today) }))
    .filter((c) => c.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) throw new Error('no_valid_catalog');
  return { slug, candidates: ranked.slice(0, 5), selected: ranked[0] };
}

const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8'));
const discovered = {};

for (const [slug, cfg] of Object.entries(LISTINGS)) {
  process.stdout.write(`Discovering ${slug}… `);
  try {
    const result = await discoverStore(slug, cfg);
    discovered[slug] = result;
    const s = result.selected;
    console.log(`${s.catalog_id} — ${s.page_count} pages — ${s.start_date ?? '?'} → ${s.end_date ?? '?'}`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    discovered[slug] = { error: String(err.message) };
  }
}

console.log('\n--- Summary ---');
for (const [slug, result] of Object.entries(discovered)) {
  if (result.error) {
    console.log(`${slug}: ERROR ${result.error}`);
    continue;
  }
  const s = result.selected;
  console.log(`${slug}: ${s.title_en?.slice(0, 50)}`);
  console.log(`  ${s.fullflyerUrl}`);
}

if (write) {
  for (const [slug, result] of Object.entries(discovered)) {
    if (result.error || !result.selected) continue;
    const prev = sources.stores[slug] ?? {};
    const sel = result.selected;
    sources.stores[slug] = {
      ...prev,
      fullflyerUrl: sel.fullflyerUrl,
      officialUrl: OFFICIAL_URLS[slug] ?? prev.officialUrl,
      title_en: sel.title_en ?? prev.title_en,
      catalog_id: sel.catalog_id,
      start_date: sel.start_date ?? prev.start_date,
      end_date: sel.end_date ?? prev.end_date,
      discoveredAt: new Date().toISOString(),
    };
    if (slug === 'panda' && prev.pages?.length) {
      sources.stores[slug].pages = prev.pages;
      sources.stores[slug].fullflyerUrl = prev.fullflyerUrl ?? sel.fullflyerUrl;
      sources.stores[slug].title_en = prev.title_en ?? sel.title_en;
      sources.stores[slug].start_date = prev.start_date ?? sel.start_date;
      sources.stores[slug].end_date = prev.end_date ?? sel.end_date;
      continue;
    }
  }
  sources.discoveredAt = new Date().toISOString();
  await fs.writeFile(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`);
  console.log(`\nWrote ${sourcesPath}`);
}
