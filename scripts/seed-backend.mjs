/**
 * Wait until Hasura /healthz is OK, then apply demo SQL seed + flyer/offers overlay.
 *
 *   node scripts/seed-backend.mjs
 *   node scripts/seed-backend.mjs --skip-sql
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(path.join(root, '.env'));

const HASURA_GRAPHQL_URL =
  process.env.HASURA_GRAPHQL_URL ?? 'http://localhost:8080/v1/graphql';
const HASURA_HEALTH = HASURA_GRAPHQL_URL.replace(/\/v1\/graphql\/?$/, '/healthz');
const ADMIN_SECRET =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? 'wain_awfar_hasura_admin_secret_dev';
const skipSql = process.argv.includes('--skip-sql');

function uuidFrom(parts) {
  const h = createHash('sha256').update(parts.join('|')).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function waitForHasura(timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(HASURA_HEALTH);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Hasura did not become healthy at ${HASURA_HEALTH}`);
}

async function hasura(query, variables = {}) {
  const res = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json.data;
}

function runSqlFile(relPath) {
  return new Promise((resolve, reject) => {
    const file = path.join(root, relPath);
    const sql = fs.readFileSync(file);
    const child = spawn(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'wain_awfar', '-d', 'wain_awfar'],
      { cwd: root, stdio: ['pipe', 'inherit', 'inherit'] },
    );
    child.stdin.write(sql);
    child.stdin.end();
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`psql ${relPath} exited ${code}`));
    });
  });
}

async function main() {
  console.log(`[seed-backend] waiting for ${HASURA_HEALTH}`);
  await waitForHasura();
  console.log('[seed-backend] Hasura is up');

  if (!skipSql) {
    console.log('[seed-backend] applying demo SQL seed');
    await runSqlFile('hasura/seeds/default/1740000000002_demo_seed.sql');
  }

  const storesData = await hasura(`
    query {
      supermarkets { id slug }
    }
  `);
  const storeBySlug = new Map(storesData.supermarkets.map((s) => [s.slug, s.id]));

  const logos = {
    carrefour: '/supermarkets/carrefour.svg',
    lulu: '/supermarkets/lulu.svg',
    panda: '/supermarkets/panda.svg',
    danube: '/supermarkets/danube.svg',
    tamimi: '/supermarkets/tamimi.svg',
    othaim: '/supermarkets/othaim.svg',
  };
  for (const [slug, logo] of Object.entries(logos)) {
    const id = storeBySlug.get(slug);
    if (!id) continue;
    await hasura(
      `
      mutation ($id: uuid!, $logo: String!) {
        update_supermarkets_by_pk(pk_columns: { id: $id }, _set: { logo_url: $logo }) { id }
      }
    `,
      { id, logo },
    );
  }

  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'frontend/src/data/leaflet-manifest.json'), 'utf8'),
  );
  const weekly = JSON.parse(
    fs.readFileSync(path.join(root, 'frontend/src/data/weekly-offers.json'), 'utf8'),
  );

  let leafletsUpserted = 0;
  let pagesUpserted = 0;
  let offersUpserted = 0;

  for (const [slug, store] of Object.entries(manifest.stores ?? {})) {
    const supermarketId = storeBySlug.get(slug);
    if (!supermarketId) {
      console.warn(`[seed-backend] skip unknown store ${slug}`);
      continue;
    }
    const start = store.start_date;
    const end = store.end_date;
    if (!start || !end) continue;

    const inserted = await hasura(
      `
      mutation ($object: leaflets_insert_input!) {
        insert_leaflets_one(
          object: $object
          on_conflict: {
            constraint: leaflets_store_window_key
            update_columns: [title_en, title_ar, source_url, original_file_url, status, city]
          }
        ) { id }
      }
    `,
      {
        object: {
          id: uuidFrom(['leaflet', slug, start, end]),
          supermarket_id: supermarketId,
          title_en: store.title_en ?? `${slug} weekly leaflet`,
          title_ar: store.title_ar ?? `نشرة ${slug}`,
          start_date: start,
          end_date: end,
          city: 'Riyadh',
          status: 'published',
          source_type: 'website',
          source_url: store.officialUrl ?? store.fullflyerUrl ?? null,
          original_file_url: store.pages?.[0]?.image_url ?? null,
        },
      },
    );
    const leafletId = inserted.insert_leaflets_one.id;
    leafletsUpserted += 1;

    const pages = (store.pages ?? []).map((p) => ({
      id: uuidFrom(['page', slug, start, String(p.page_number)]),
      leaflet_id: leafletId,
      page_number: p.page_number,
      image_url: p.image_url,
      processing_status: 'ready',
    }));
    if (pages.length) {
      await hasura(
        `
        mutation ($objects: [leaflet_pages_insert_input!]!) {
          insert_leaflet_pages(
            objects: $objects
            on_conflict: {
              constraint: leaflet_pages_leaflet_id_page_number_key
              update_columns: [image_url, processing_status]
            }
          ) { affected_rows }
        }
      `,
        { objects: pages },
      );
      pagesUpserted += pages.length;
    }

    const storeOffers = weekly.stores?.[slug]?.offers ?? [];
    const offerRows = storeOffers
      .filter((o) => o.productId && Number(o.offer_price) > 0)
      .map((o) => ({
        id: uuidFrom(['offer', slug, o.productId, start, end]),
        product_id: o.productId,
        supermarket_id: supermarketId,
        leaflet_id: leafletId,
        offer_price: Number(o.offer_price),
        regular_price: o.regular_price != null ? Number(o.regular_price) : null,
        effective_price: Number(o.offer_price),
        display_price: Number(o.offer_price),
        currency: 'SAR',
        promotion_type: 'standard_discount',
        promotion_description_en: o.promotion_en ?? 'Weekly flyer offer',
        promotion_description_ar: o.promotion_ar ?? 'عرض النشرة الأسبوعية',
        start_date: start,
        end_date: end,
        city: 'Riyadh',
        is_demo: false,
        active: true,
        verified: false,
        validation_status: 'valid',
      }));

    if (offerRows.length) {
      await hasura(
        `
        mutation ($objects: [supermarket_offers_insert_input!]!) {
          insert_supermarket_offers(
            objects: $objects
            on_conflict: {
              constraint: supermarket_offers_product_store_window_key
              update_columns: [
                offer_price, regular_price, effective_price, display_price,
                promotion_description_en, promotion_description_ar,
                leaflet_id, is_demo, active
              ]
            }
          ) { affected_rows }
        }
      `,
        { objects: offerRows },
      );
      offersUpserted += offerRows.length;
    }
  }

  await hasura(`
    mutation {
      update_supermarket_offers(
        where: { is_demo: { _eq: true } }
        _set: { active: false }
      ) { affected_rows }
    }
  `);

  const check = await hasura(`
    query {
      leaflets_aggregate(where: { status: { _eq: "published" } }) { aggregate { count } }
      supermarket_offers_aggregate(where: { active: { _eq: true } }) { aggregate { count } }
      products_aggregate(where: { active: { _eq: true } }) { aggregate { count } }
    }
  `);

  console.log(
    `[seed-backend] leaflets=${leafletsUpserted} pages=${pagesUpserted} flyerOffers=${offersUpserted}`,
  );
  console.log(
    `[seed-backend] totals publishedLeaflets=${check.leaflets_aggregate.aggregate.count} offers=${check.supermarket_offers_aggregate.aggregate.count} products=${check.products_aggregate.aggregate.count}`,
  );
}

main().catch((err) => {
  console.error('[seed-backend] FAILED', err);
  process.exit(1);
});
