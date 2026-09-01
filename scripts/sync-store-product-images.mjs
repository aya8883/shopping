/**
 * Download per-store product images from official retailer promotion CDNs.
 * Writes cached JPEGs under frontend/public/products/stores/{store}/{productId}.jpg
 * and a manifest consumed by the frontend.
 *
 * Usage: node scripts/sync-store-product-images.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'data/store-product-images.json');
const catalogPath = path.join(root, 'frontend/src/data/catalog.ts');
const hotspotsPath = path.join(root, 'frontend/src/data/leafletHotspots.ts');
const outDir = path.join(root, 'frontend/public/products/stores');
const manifestPath = path.join(root, 'frontend/src/data/product-images-manifest.json');

const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

function parseCatalogProductIds(ts) {
  return [...ts.matchAll(/id: '(44444444-4444-4444-4444-444444444\d+)'/g)].map((m) => m[1]);
}

function parseCanonicalIds(ts) {
  return [...ts.matchAll(/id: '([a-z0-9-]+)', name_en:/g)]
    .map((m) => m[1])
    .filter((id) => id.includes('-'));
}

function parseCategoryByProductId(ts, productId) {
  const block = ts.slice(ts.indexOf(`id: '${productId}'`));
  const slug = block.match(/category: cat\('([^']+)'\)/)?.[1];
  return slug ?? 'dairy';
}

function sourceFileForProduct(productId, categorySlug) {
  const override = config.productOverrides[productId];
  if (override) return override;
  return config.categoryImages[categorySlug] ?? config.categoryImages.dairy;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'WainAwfar/1.0 product-image-sync' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return buf.length;
}

const catalogTs = await fs.readFile(catalogPath, 'utf8');
const hotspotsTs = await fs.readFile(hotspotsPath, 'utf8');
const catalogIds = parseCatalogProductIds(catalogTs);
const canonicalIds = parseCanonicalIds(hotspotsTs);
const allProducts = [...new Set([...catalogIds, ...canonicalIds])];

const manifest = {
  syncedAt: new Date().toISOString(),
  attribution: config.attribution,
  images: {},
};

for (const store of config.stores) {
  for (const productId of allProducts) {
    const categorySlug = catalogIds.includes(productId)
      ? parseCategoryByProductId(catalogTs, productId)
      : (hotspotsTs.match(new RegExp(`id: '${productId}'[\\s\\S]*?category_slug: '([^']+)'`))?.[1] ?? 'dairy');

    const file = sourceFileForProduct(productId, categorySlug);
    const url = `${config.carrefourCdnBase}/${file}`;
    const rel = `/products/stores/${store}/${productId}.jpg`;
    const dest = path.join(outDir, store, `${productId}.jpg`);

    process.stdout.write(`${store}/${productId.slice(-3)}… `);
    try {
      const bytes = await download(url, dest);
      manifest.images[`${store}/${productId}`] = rel;
      console.log(`${Math.round(bytes / 1024)}KB`);
    } catch (err) {
      console.log(`FAILED (${err.message})`);
    }
  }
}

await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nWrote ${manifestPath} (${Object.keys(manifest.images).length} images)`);
