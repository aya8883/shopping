/**
 * Fetch real weekly leaflet page images from FullFlyer/ilofo CDN
 * and write frontend/public/data/leaflet-manifest.json
 *
 * Usage: node scripts/sync-leaflets.mjs [--pages=6] [--download]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourcesPath = path.join(root, 'data/leaflet-sources.json');
const outManifest = path.join(root, 'frontend/src/data/leaflet-manifest.json');
const outManifestPublic = path.join(root, 'frontend/public/data/leaflet-manifest.json');
const publicLeaflets = path.join(root, 'frontend/public/leaflets');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);
const maxPages = Number(args.pages ?? 6);
const download = args.download === 'true';

function decodeHtml(s) {
  return s.replace(/&amp;/g, '&');
}

function parseFullFlyerCatalogHtml(html, sourceUrl) {
  const catalogId =
    sourceUrl.match(/catalogs\/(\d+)-pdf/i)?.[1] ??
    html.match(/catalogs\/img\/(\d+)\//)?.[1] ??
    'unknown';

  const title =
    html.match(/<h1[^>]*>([^<]+)</i)?.[1]?.trim() ??
    html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1]?.trim();

  const startRaw = html.match(/Start date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  const endRaw = html.match(/End date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();

  const hiRes = [
    ...html.matchAll(
      new RegExp(
        `cdn\\.ilofo\\.com/storage/catalogs/img/${catalogId}/([^"'\\s]+?)\\.(jpg|jpeg|png|webp)\\?w=1600`,
        'gi',
      ),
    ),
  ].map((m) => ({
    key: `${m[1]}.${m[2].toLowerCase()}`,
    url: decodeHtml(
      `https://cdn.ilofo.com/storage/catalogs/img/${catalogId}/${m[1]}.${m[2]}?w=1600&h=1600`,
    ),
  }));

  const byKey = new Map();
  for (const item of hiRes) byKey.set(item.key, item.url);

  const suffixPages = [];
  const uniqueHashes = [];
  for (const key of byKey.keys()) {
    const suffixMatch = key.match(/^([a-f0-9]+)-(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (suffixMatch) {
      suffixPages.push({ page_number: Number(suffixMatch[2]) + 1, image_url: byKey.get(key) });
    } else {
      uniqueHashes.push(key);
    }
  }

  let pages;
  if (suffixPages.length) {
    pages = suffixPages.sort((a, b) => a.page_number - b.page_number);
  } else {
    pages = uniqueHashes.map((key, index) => ({
      page_number: index + 1,
      image_url: byKey.get(key),
    }));
  }

  const start_date = startRaw && !Number.isNaN(Date.parse(startRaw)) ? new Date(startRaw).toISOString().slice(0, 10) : undefined;
  const end_date = endRaw && !Number.isNaN(Date.parse(endRaw)) ? new Date(endRaw).toISOString().slice(0, 10) : undefined;

  return {
    catalog_id: catalogId,
    source_url: sourceUrl,
    title_en: title,
    start_date,
    end_date,
    pages: pages.slice(0, maxPages),
  };
}

async function maybeDownload(slug, pages) {
  if (!download) return pages;
  const dir = path.join(publicLeaflets, slug);
  await fs.mkdir(dir, { recursive: true });
  const localPages = [];
  for (const page of pages) {
    const ext = page.image_url.includes('.webp') ? 'webp' : 'jpg';
    const filename = `page-${page.page_number}.${ext}`;
    const dest = path.join(dir, filename);
    const res = await fetch(page.image_url);
    if (!res.ok) throw new Error(`download_failed ${slug} page ${page.page_number}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buf);
    localPages.push({ ...page, image_url: `/leaflets/${slug}/${filename}` });
  }
  return localPages;
}

const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8'));
const manifest = {
  syncedAt: new Date().toISOString(),
  attribution: sources.attribution,
  stores: {},
};

for (const [slug, cfg] of Object.entries(sources.stores)) {
  process.stdout.write(`Fetching ${slug}… `);
  try {
    const res = await fetch(cfg.fullflyerUrl, { headers: { 'User-Agent': 'WainAwfar/1.0 leaflet-sync' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const parsed = parseFullFlyerCatalogHtml(html, cfg.fullflyerUrl);
    const pages = await maybeDownload(slug, parsed.pages);
    manifest.stores[slug] = {
      ...cfg,
      catalog_id: parsed.catalog_id,
      fullflyerUrl: cfg.fullflyerUrl,
      title_en: cfg.title_en ?? parsed.title_en,
      start_date: parsed.start_date,
      end_date: parsed.end_date,
      pages,
    };
    console.log(`${pages.length} pages (catalog ${parsed.catalog_id})`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    manifest.stores[slug] = { ...cfg, error: String(err.message), pages: [] };
  }
}

await fs.mkdir(path.dirname(outManifest), { recursive: true });
const manifestJson = JSON.stringify(manifest, null, 2);
await fs.writeFile(outManifest, manifestJson);
await fs.mkdir(path.dirname(outManifestPublic), { recursive: true });
await fs.writeFile(outManifestPublic, manifestJson);
console.log(`Wrote ${outManifest}`);
