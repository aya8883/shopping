/**
 * Full refresh of weekly promotion data.
 * 1) Discover latest catalogs (FullFlyer, with 3orod fallback)
 * 2) Sync leaflet page URLs / images into manifests
 * 3) Regenerate weekly offer overlay prices
 * 4) Fail if any store flyer is expired (so CI surfaces staleness)
 *
 * Usage:
 *   node scripts/sync-all.mjs
 *   node scripts/sync-all.mjs --images
 *   node scripts/sync-all.mjs --no-download --pages=8
 *   node scripts/sync-all.mjs --allow-stale   # skip freshness exit code
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const withImages = args.includes('--images');
const noDownload = args.includes('--no-download');
const allowStale = args.includes('--allow-stale');
const pagesArg = args.find((a) => a.startsWith('--pages='));

function run(script, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...extraArgs], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(script)} exited with code ${code}`));
    });
  });
}

console.log(`[sync-all] started ${new Date().toISOString()}`);

await run(path.join(root, 'scripts/discover-leaflet-catalogs.mjs'), ['--write']);

const leafletArgs = [];
if (noDownload) leafletArgs.push('--no-download');
if (pagesArg) leafletArgs.push(pagesArg);
await run(path.join(root, 'scripts/sync-leaflets.mjs'), leafletArgs);

if (withImages) {
  await run(path.join(root, 'scripts/sync-store-product-images.mjs'));
}

// Always refresh flyer-sourced prices used by Search / Basket in mock mode.
await run(path.join(root, 'scripts/generate-weekly-offers.mjs'));

try {
  await run(path.join(root, 'scripts/check-leaflet-freshness.mjs'), ['--strict']);
} catch (err) {
  if (allowStale) {
    console.warn(`[sync-all] freshness check failed but --allow-stale set: ${err.message}`);
  } else {
    throw err;
  }
}

console.log(`[sync-all] finished ${new Date().toISOString()}`);
