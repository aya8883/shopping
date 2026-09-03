/**
 * Weekly flyer OCR -> product matching -> Hasura persistence.
 *
 * Stage 1 goal: use FullFlyer/ilofo flyer images as the authoritative weekly
 * price source (instead of scraping retailer catalogs).
 *
 * Assumptions:
 * - `functions/leaflet-processing` is running (default http://localhost:3010).
 * - Hasura is running (default http://localhost:8080/v1/graphql) and the env
 *   var HASURA_GRAPHQL_ADMIN_SECRET is available (loaded from root .env).
 *
 * De-dupe:
 * - If a "published" leaflet already exists for (storeSlug, start_date, end_date),
 *   the script skips inserting it.
 *
 * Usage:
 *   node scripts/ingest-weekly-flyers.mjs --pages=6
 *   node scripts/ingest-weekly-flyers.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!key) continue;
    // Don't clobber explicitly provided env vars.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(path.join(root, '.env'));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const pages = Number(args.pages ?? 6);
const dryRun = args['dry-run'] === true;

const LEAFLET_SERVICE_URL = process.env.LEAFLET_SERVICE_URL ?? 'http://localhost:3010';
const HASURA_GRAPHQL_URL =
  process.env.HASURA_GRAPHQL_URL ??
  'http://localhost:8080/v1/graphql';
const HASURA_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

const CITY = 'Riyadh';
const CURRENCY = 'SAR';

function safeLog(...xs) {
  console.log(...xs);
}

async function hasuraRequest(query, variables) {
  if (!HASURA_GRAPHQL_ADMIN_SECRET) {
    throw new Error('HASURA_GRAPHQL_ADMIN_SECRET is missing.');
  }

  const res = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Hasura non-JSON response: HTTP ${res.status}`);
  }
  if (json.errors?.length) {
    throw new Error(`Hasura error: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  return json.data;
}

async function getInsertInputFields(tableName) {
  const candidates = [`${tableName}_insert_input`, `public_${tableName}_insert_input`];
  for (const typeName of candidates) {
    const data = await hasuraRequest(
      `
        query Fields($typeName: String!) {
          __type(name: $typeName) {
            inputFields { name }
          }
        }
      `,
      { typeName },
    );
    const inputFields = data?.__type?.inputFields;
    if (Array.isArray(inputFields) && inputFields.length) {
      return { typeName, fields: new Set(inputFields.map((f) => f.name)) };
    }
  }
  throw new Error(`Could not find ${tableName} insert input type in Hasura.`);
}

function filterToAllowed(obj, allowedFields) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!allowedFields.has(k)) continue;
    out[k] = v;
  }
  return out;
}

async function hasuraInsert(tableName, objects) {
  if (!objects.length) return [];
  const { typeName, fields } = await getInsertInputFields(tableName);
  const filteredObjects = objects.map((o) => filterToAllowed(o, fields));

  const mutation = `
    mutation Insert($objects: [${typeName}!]!) {
      insert_${tableName}(objects: $objects) {
        returning { id }
      }
    }
  `;

  const data = await hasuraRequest(mutation, { objects: filteredObjects });
  return data?.[`insert_${tableName}`]?.returning ?? [];
}

function thisWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun..6=Sat
  const daysSinceSaturday = (day + 1) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), today: iso(today) };
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${url}${text ? `: ${text.slice(0, 120)}` : ''}`);
  }
  return res.json();
}

async function main() {
  const { start: weekStart, end: weekEnd } = thisWeekRange();

  safeLog(`[ingest-weekly-flyers] pages=${pages} dryRun=${dryRun}`);
  safeLog(`[ingest-weekly-flyers] leaflet service: ${LEAFLET_SERVICE_URL}`);
  safeLog(
    `[ingest-weekly-flyers] hasura: ${HASURA_GRAPHQL_URL} (admin secret ${
      HASURA_GRAPHQL_ADMIN_SECRET ? 'set' : 'missing'
    })`,
  );

  if (dryRun) {
    safeLog('[ingest-weekly-flyers] Dry run: no Hasura writes.');
  }

  let catalog;
  let supermarketsBySlug;

  if (!dryRun) {
    const catQuery = `
      query GetCatalogForPlanner($limit: Int = 100) {
        products(
          where: { active: { _eq: true } }
          limit: $limit
          order_by: { name_en: asc }
        ) {
          id
          name_en
          name_ar
          size_value
          size_unit
          brand {
            name_en
            name_ar
          }
        }
      }
    `;
    const catData = await hasuraRequest(catQuery, { limit: 200 });
    catalog = catData?.products ?? [];

    const storesQuery = `
      query GetSupermarkets {
        supermarkets(
          where: { active: { _eq: true } }
          order_by: { name_en: asc }
        ) {
          id
          slug
          name_en
          name_ar
        }
      }
    `;
    const storesData = await hasuraRequest(storesQuery);
    supermarketsBySlug = new Map(
      (storesData?.supermarkets ?? []).map((s) => [s.slug, s]),
    );
  } else {
    catalog = [];
    supermarketsBySlug = new Map();
  }

  const fetched = await fetchJson(`${LEAFLET_SERVICE_URL}/v1/leaflets/fetch?pages=${pages}`);
  const stores = fetched?.stores ?? {};

  let processedStores = 0;
  let insertedLeaflets = 0;

  for (const [storeSlug, storeInfo] of Object.entries(stores)) {
    if (!storeInfo) continue;
    const storePages = storeInfo.pages ?? [];
    if (!storePages.length) continue;

    const start_date = storeInfo.start_date ?? weekStart;
    const end_date = storeInfo.end_date ?? weekEnd;

    if (dryRun) {
      safeLog(`[ingest-weekly-flyers][dry-run] would ingest ${storeSlug} (${start_date}..${end_date})`);
      processedStores++;
      continue;
    }

    const supermarketMeta = supermarketsBySlug.get(storeSlug);
    if (!supermarketMeta) {
      safeLog(`[ingest-weekly-flyers] skip ${storeSlug}: supermarket not found in Hasura`);
      continue;
    }

    const existingQuery = `
      query ExistingLeaflet($slug: String!, $start: date!, $end: date!) {
        leaflets(
          where: {
            status: { _eq: "published" }
            start_date: { _eq: $start }
            end_date: { _eq: $end }
            supermarket: { slug: { _eq: $slug } }
          }
        ) {
          id
        }
      }
    `;
    const existing = await hasuraRequest(existingQuery, {
      slug: storeSlug,
      start: start_date,
      end: end_date,
    });
    if (existing?.leaflets?.length) {
      safeLog(
        `[ingest-weekly-flyers] skip ${storeSlug}: already published for ${start_date}..${end_date}`,
      );
      continue;
    }

    safeLog(`[ingest-weekly-flyers] ingest ${storeSlug} (${start_date}..${end_date})`);
    processedStores++;

    const fileUrl = storePages[0].image_url;
    const ingestRes = await fetchJson(`${LEAFLET_SERVICE_URL}/v1/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supermarketSlug: storeSlug,
        fileUrl,
        catalog,
        startDate: start_date,
        endDate: end_date,
      }),
    });

    const matches = ingestRes?.matches ?? [];
    const matchedOffers = matches.filter(
      (m) => m?.product?.id && Number(m.offer_price) > 0,
    );

    if (!matchedOffers.length) {
      safeLog(`[ingest-weekly-flyers] no matched offers for ${storeSlug} — not inserting leaflet`);
      continue;
    }

    const supermarketId = supermarketMeta.id;
    const leafletInput = {
      supermarket_id: supermarketId,
      title_en: storeInfo.title_en ?? `${storeSlug} weekly leaflet`,
      title_ar: storeInfo.title_ar ?? `نشرة ${storeSlug} الأسبوعية`,
      start_date,
      end_date,
      city: CITY,
      status: 'published',
      source_url: storeInfo.officialUrl ?? storeInfo.fullflyerUrl ?? null,
      original_file_url: fileUrl,
    };

    const [leafletRow] = await hasuraInsert('leaflets', [leafletInput]);
    if (!leafletRow?.id) throw new Error(`Failed to insert leaflets for ${storeSlug}`);
    const leafletId = leafletRow.id;

    await hasuraInsert(
      'leaflet_pages',
      storePages.map((p) => ({
        leaflet_id: leafletId,
        page_number: p.page_number,
        image_url: p.image_url,
        processing_status: 'ready',
      })),
    );

    const offerInputs = matchedOffers.map((m) => ({
      leaflet_id: leafletId,
      supermarket_id: supermarketId,
      product_id: m.product.id,
      offer_price: Number(m.offer_price),
      regular_price: m.regular_price ?? null,
      effective_price: Number(m.offer_price),
      currency: CURRENCY,
      is_demo: true,
      promotion_description_en: m.offerBlock?.promotion ?? 'Weekly offer',
      promotion_description_ar: 'عرض الأسبوع',
      active: true,
    }));

    await hasuraInsert('supermarket_offers', offerInputs);

    insertedLeaflets++;
    safeLog(`[ingest-weekly-flyers] inserted ${storeSlug}: offers=${offerInputs.length}`);
  }

  safeLog(
    `[ingest-weekly-flyers] done processedStores=${processedStores} insertedLeaflets=${insertedLeaflets}`,
  );
}

main().catch((err) => {
  console.error('[ingest-weekly-flyers] FAILED', err);
  process.exit(1);
});

