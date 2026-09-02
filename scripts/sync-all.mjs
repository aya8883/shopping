/**
 * Full refresh of weekly promotion data.
 * 1) Discover latest FullFlyer catalogs per store
 * 2) Sync leaflet page URLs / images into manifests
 * 3) Optionally refresh product category images (--images)
 *
 * Usage:
 *   node scripts/sync-all.mjs
 *   node scripts/sync-all.mjs --images
 *   node scripts/sync-all.mjs --download --pages=8
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const withImages = args.includes('--images');
const download = args.includes('--download');
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
if (download) leafletArgs.push('--download=true');
if (pagesArg) leafletArgs.push(pagesArg);
await run(path.join(root, 'scripts/sync-leaflets.mjs'), leafletArgs);

if (withImages) {
  await run(path.join(root, 'scripts/sync-store-product-images.mjs'));
}

console.log(`[sync-all] finished ${new Date().toISOString()}`);
