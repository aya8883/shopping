/**
 * Fail (exit 1) if any store flyer in leaflet-sources.json is expired.
 * Used by sync-all / GitHub Actions so stale data is visible in CI.
 *
 * Usage: node scripts/check-leaflet-freshness.mjs [--strict]
 *   --strict  also fail when a store has zero pages in the synced manifest
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourcesPath = path.join(root, 'data/leaflet-sources.json');
const manifestPath = path.join(root, 'frontend/src/data/leaflet-manifest.json');
const strict = process.argv.includes('--strict');

const today = new Date().toISOString().slice(0, 10);

const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8'));
let manifest = null;
try {
  manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
} catch {
  /* optional */
}

const problems = [];

for (const [slug, cfg] of Object.entries(sources.stores ?? {})) {
  const end = cfg.end_date;
  const start = cfg.start_date;
  const pages =
    cfg.pages?.length ??
    manifest?.stores?.[slug]?.pages?.length ??
    0;

  if (!end) {
    problems.push(`${slug}: missing end_date`);
    continue;
  }
  if (end < today) {
    problems.push(`${slug}: expired ${start ?? '?'} → ${end} (today ${today})`);
  }
  if (strict && pages < 1) {
    problems.push(`${slug}: no flyer pages in sources/manifest`);
  }
}

if (!problems.length) {
  console.log(`All store flyers cover today (${today}).`);
  process.exit(0);
}

console.error(`Leaflet freshness check failed (${problems.length}):`);
for (const p of problems) console.error(`  - ${p}`);
process.exit(1);
