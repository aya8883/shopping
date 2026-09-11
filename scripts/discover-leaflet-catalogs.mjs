/**
 * Discover the latest weekly catalog per supermarket.
 *
 * Priority:
 *  1) FullFlyer/ilofo catalog whose dates cover today
 *  2) 3orod.net store offer page (image override) when FullFlyer is missing/expired
 *  3) Freshest FullFlyer catalog (even if expired) as last resort
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
const today = new Date().toISOString().slice(0, 10);
const UA = { 'User-Agent': 'WainAwfar/1.0 catalog-discovery' };

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

const STORE_NAME_AR = {
  carrefour: 'كارفور',
  lulu: 'لولو',
  panda: 'بنده',
  danube: 'الدانوب',
  tamimi: 'التميمي',
  othaim: 'العثيم',
};

/** 3orod listing pages to scrape for current weeklies. */
const THREEOROD = {
  carrefour: {
    seeds: [
      'https://3orod.net/sa/store/carrefour/',
      'https://3orod.net/sa/?s=carrefour',
    ],
    match: /\/offers\/carrefour-/i,
  },
  lulu: {
    seeds: ['https://3orod.net/sa/store/lulu/', 'https://3orod.net/sa/?s=lulu'],
    match: /\/offers\/lulu-/i,
  },
  panda: {
    seeds: [
      'https://3orod.net/sa/store/panda/',
      'https://3orod.net/sa/?s=panda+weekly',
      'https://3orod.net/sa/?s=panda',
    ],
    match: /\/offers\/panda(?:-weekly)?-/i,
    prefer: /panda-weekly-/i,
  },
  danube: {
    seeds: ['https://3orod.net/sa/store/danube/', 'https://3orod.net/sa/?s=danube'],
    match: /\/offers\/danube-/i,
  },
  tamimi: {
    seeds: [
      'https://3orod.net/sa/store/tamimi-markets/',
      'https://3orod.net/sa/?s=tamimi',
      'https://3orod.net/sa/?s=Tamimi',
      'https://3orod.net/sa/?s=%D8%A7%D9%84%D8%AA%D9%85%D9%8A%D9%85%D9%8A',
    ],
    match: /\/offers\/tamimi/i,
  },
  othaim: {
    seeds: ['https://3orod.net/sa/store/othaim/', 'https://3orod.net/sa/?s=othaim'],
    match: /\/offers\/othaim-/i,
  },
};

const MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function isoDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseDisplayDate(raw) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function isActive(start, end, day = today) {
  return Boolean(start && end && start <= day && end >= day);
}

function isExpired(end, day = today) {
  return Boolean(end && end < day);
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: UA, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { url: res.url, html: await res.text() };
}

function catalogIdsFromListing(html, listingPath) {
  const re = new RegExp(`${listingPath}/catalogs/(\\d+)-pdf`, 'gi');
  return [...new Set([...html.matchAll(re)].map((m) => m[1]))];
}

async function inspectCatalog(listingPath, catalogId) {
  const url = `https://www.fullflyer.com/sa-en-offers/${listingPath}/catalogs/${catalogId}-pdf`;
  const { html } = await fetchHtml(url);
  const title = html.match(/<h1[^>]*>([^<]+)/i)?.[1]?.trim() ?? '';
  const startRaw = html.match(/Start date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  const endRaw = html.match(/End date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  const numbered = [
    ...html.matchAll(
      new RegExp(`catalogs/img/${catalogId}/[^"'\\s]+-(\\d+)\\.(?:jpg|jpeg|png|webp)`, 'gi'),
    ),
  ];
  const anyImgs = [
    ...html.matchAll(
      new RegExp(
        `cdn\\.ilofo\\.com/storage/catalogs/img/${catalogId}/([^"'\\s?]+)\\.(?:jpg|jpeg|png|webp)`,
        'gi',
      ),
    ),
  ];
  const pageCount = Math.max(
    new Set(numbered.map((m) => m[1])).size,
    new Set(anyImgs.map((m) => m[1].toLowerCase())).size,
  );
  const start_date = startRaw ? parseDisplayDate(startRaw) : undefined;
  const end_date = endRaw ? parseDisplayDate(endRaw) : undefined;

  return {
    source: 'fullflyer',
    catalog_id: catalogId,
    fullflyerUrl: url,
    title_en: title.replace(/\s+/g, ' '),
    start_date,
    end_date,
    page_count: pageCount,
    is_bidder: /bidder/i.test(title),
  };
}

function isCashAndCarry(...parts) {
  return parts.some(
    (p) =>
      typeof p === 'string' &&
      /cash\s*(&|and)\s*carry|كاش\s*(آند|اند)\s*كاري/i.test(p),
  );
}

function scoreFullFlyer(c) {
  if (c.is_bidder || c.page_count < 1) return -1;
  if (isCashAndCarry(c.title_en, c.title_ar, c.fullflyerUrl)) return -1;
  let score = Math.min(c.page_count, 40) * 2;
  if (c.start_date && c.end_date) {
    if (isActive(c.start_date, c.end_date)) score += 1000;
    else if (c.end_date >= today) score += 200;
    else score -= 50;
    score += Number(c.end_date.replaceAll('-', '')) / 1e6;
  }
  return score;
}

async function discoverFullFlyer(slug, { path: listingPath, listing }) {
  const { html } = await fetchHtml(listing);
  const ids = catalogIdsFromListing(html, listingPath).slice(0, 18);
  if (!ids.length) throw new Error('no_catalogs_on_listing');

  const inspected = [];
  for (const id of ids) {
    try {
      inspected.push(await inspectCatalog(listingPath, id));
    } catch {
      /* skip */
    }
  }

  const ranked = inspected
    .map((c) => ({ ...c, score: scoreFullFlyer(c) }))
    .filter((c) => c.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) throw new Error('no_valid_catalog');
  return { candidates: ranked.slice(0, 5), selected: ranked[0] };
}

/** Parse start/end dates from a 3orod offer slug. */
function datesFromOfferUrl(offerUrl) {
  const slug = offerUrl.replace(/\/+$/, '').split('/').pop() ?? '';
  // 9-15-september-2026
  let m = slug.match(/(\d{1,2})-(\d{1,2})-([a-z]+)-(\d{4})/i);
  if (m) {
    const month = MONTHS[m[3].toLowerCase()];
    if (month) {
      return {
        start_date: isoDate(m[4], month, Number(m[1])),
        end_date: isoDate(m[4], month, Number(m[2])),
      };
    }
  }
  // 26-august-1-september-2026
  m = slug.match(/(\d{1,2})-([a-z]+)-(\d{1,2})-([a-z]+)-(\d{4})/i);
  if (m) {
    const m1 = MONTHS[m[2].toLowerCase()];
    const m2 = MONTHS[m[4].toLowerCase()];
    if (m1 && m2) {
      return {
        start_date: isoDate(m[5], m1, Number(m[1])),
        end_date: isoDate(m[5], m2, Number(m[3])),
      };
    }
  }
  return {};
}

function score3orod(c) {
  if (!c.pages?.length) return -1;
  if (isCashAndCarry(c.title_en, c.title_ar, c.offerUrl, c.fullflyerUrl)) return -1;
  let score = c.pages.length * 5;
  if (c.prefer_boost) score += 50;
  if (c.start_date && c.end_date) {
    if (isActive(c.start_date, c.end_date)) score += 1000;
    else if (c.end_date >= today) score += 200;
    else score -= 50;
    score += Number(c.end_date.replaceAll('-', '')) / 1e6;
  }
  return score;
}

function pickFlyerImages(html, offerUrl) {
  const offerSlug = offerUrl.replace(/\/+$/, '').split('/').pop() ?? '';
  const stem = offerSlug.replace(/-\d+$/, ''); // carrefour-9-15-september-2026-2 → base-ish
  const imgs = [
    ...html.matchAll(
      /(?:src|data-src|data-lazy-src|href)="(https?:\/\/3orod\.net\/sa\/wp-content\/uploads\/[^"]+)"/gi,
    ),
  ].map((m) => m[1]);

  const uniq = [...new Set(imgs)].filter(
    (u) => !/150x150|300x\d+|356x200|logo|favicon|featured/i.test(u),
  );

  const matching = uniq.filter((u) => {
    const file = u.toLowerCase();
    return (
      file.includes(offerSlug.toLowerCase()) ||
      file.includes(stem.toLowerCase()) ||
      /1200x|1572|scaled|1024x1024|1500/i.test(file)
    );
  });

  const preferred = matching
    .filter((u) => new RegExp(offerSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(u))
    .sort((a, b) => {
      const rank = (u) =>
        (/1200x|1572|scaled/i.test(u) ? 100 : 0) + (/1024x/i.test(u) ? 20 : 0) + u.length / 1000;
      return rank(b) - rank(a);
    });

  const chosen = preferred.length
    ? preferred.slice(0, 6)
    : matching.filter((u) => /1200x|1572|scaled/i.test(u)).slice(0, 6);

  // Dedupe by normalized stem without size suffix
  const pages = [];
  const seen = new Set();
  for (const url of chosen) {
    const key = url.replace(/-\d+x\d+(?=\.|$)/i, '').replace(/-scaled(?=\.|$)/i, '');
    if (seen.has(key)) continue;
    seen.add(key);
    pages.push({ page_number: pages.length + 1, image_url: url });
  }
  return pages;
}

async function inspect3orodOffer(offerUrl, { prefer = false } = {}) {
  const { html } = await fetchHtml(offerUrl);
  const titleTag = html.match(/<title>([^<]+)/i)?.[1]?.trim() ?? '';
  const title_ar = cleanScrapedTitleAr(titleTag);
  const dates = datesFromOfferUrl(offerUrl);
  const pages = pickFlyerImages(html, offerUrl);
  const title_en =
    offerUrl
      .replace(/\/+$/, '')
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Weekly offers';

  return {
    source: '3orod',
    offerUrl,
    fullflyerUrl: offerUrl,
    title_en: title_en.slice(0, 120),
    title_ar: title_ar || undefined,
    start_date: dates.start_date,
    end_date: dates.end_date,
    pages,
    page_count: pages.length,
    prefer_boost: prefer,
  };
}

async function discover3orod(slug) {
  const cfg = THREEOROD[slug];
  if (!cfg) return null;

  const offerLinks = new Set();
  for (const seed of cfg.seeds) {
    try {
      const { html } = await fetchHtml(seed);
      for (const m of html.matchAll(/href="(https?:\/\/3orod\.net\/sa\/offers\/[^"#]+)/gi)) {
        const clean = `${m[1].replace(/\/+$/, '')}/`;
        if (cfg.match.test(clean)) offerLinks.add(clean);
      }
    } catch {
      /* seed missing is fine */
    }
  }

  const urls = [...offerLinks];
  if (!urls.length) return null;

  const inspected = [];
  // Cap network: inspect up to 8 newest-looking URLs
  const ordered = urls.sort((a, b) => {
    const pref = (u) => (cfg.prefer?.test(u) ? 1 : 0);
    return pref(b) - pref(a) || b.localeCompare(a);
  });

  for (const url of ordered.slice(0, 8)) {
    try {
      inspected.push(
        await inspect3orodOffer(url, { prefer: Boolean(cfg.prefer?.test(url)) }),
      );
    } catch {
      /* skip */
    }
  }

  const ranked = inspected
    .map((c) => ({ ...c, score: score3orod(c) }))
    .filter((c) => c.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return null;
  return { candidates: ranked.slice(0, 5), selected: ranked[0] };
}

function defaultTitleAr(slug, start, end) {
  const name = STORE_NAME_AR[slug] ?? slug;
  if (start && end) return `عروض ${name} — ${start} إلى ${end}`;
  return `عروض ${name}`;
}

function cleanScrapedTitleAr(raw) {
  if (!raw) return '';
  return raw
    .replace(/\s*-\s*عروض نت.*$/i, '')
    .replace(/السعودية\s+السعودية/g, 'السعودية')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickBest(slug, fullflyer, threeorod) {
  const ff = fullflyer?.selected;
  const t3 = threeorod?.selected;

  const ffActive = ff && isActive(ff.start_date, ff.end_date);
  const t3Active = t3 && isActive(t3.start_date, t3.end_date) && t3.pages?.length;

  if (ffActive) {
    return {
      ...ff,
      title_ar: defaultTitleAr(slug, ff.start_date, ff.end_date),
      reason: 'fullflyer_active',
    };
  }
  if (t3Active) {
    return {
      ...t3,
      title_ar: defaultTitleAr(slug, t3.start_date, t3.end_date),
      reason: '3orod_active',
    };
  }
  // Prefer freshest end_date between the two
  const opts = [ff, t3].filter(Boolean);
  opts.sort((a, b) => String(b.end_date ?? '').localeCompare(String(a.end_date ?? '')));
  const best = opts[0];
  if (!best) throw new Error('no_source');
  return {
    ...best,
    title_ar: defaultTitleAr(slug, best.start_date, best.end_date),
    reason: best.source === '3orod' ? '3orod_stale_fallback' : 'fullflyer_stale_fallback',
  };
}

function toStoreRecord(slug, prev, sel) {
  const base = {
    officialUrl: OFFICIAL_URLS[slug] ?? prev.officialUrl,
    title_en: sel.title_en ?? prev.title_en,
    title_ar: sel.title_ar ?? prev.title_ar,
    start_date: sel.start_date ?? prev.start_date,
    end_date: sel.end_date ?? prev.end_date,
    discoveredAt: new Date().toISOString(),
  };

  if (sel.source === '3orod' && sel.pages?.length) {
    return {
      ...base,
      fullflyerUrl: sel.offerUrl ?? sel.fullflyerUrl,
      pages: sel.pages,
      page_source: '3orod',
    };
  }

  return {
    ...base,
    fullflyerUrl: sel.fullflyerUrl,
    catalog_id: sel.catalog_id,
  };
}

const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8'));
const discovered = {};

for (const [slug, cfg] of Object.entries(LISTINGS)) {
  process.stdout.write(`Discovering ${slug}… `);
  try {
    let fullflyer = null;
    let threeorod = null;
    try {
      fullflyer = await discoverFullFlyer(slug, cfg);
    } catch (err) {
      fullflyer = { error: String(err.message) };
    }
    try {
      threeorod = await discover3orod(slug);
    } catch {
      threeorod = null;
    }

    const selected = pickBest(
      slug,
      fullflyer?.selected ? fullflyer : null,
      threeorod,
    );
    discovered[slug] = {
      selected,
      fullflyer: fullflyer?.selected
        ? { id: fullflyer.selected.catalog_id, end: fullflyer.selected.end_date }
        : fullflyer?.error,
      threeorod: threeorod?.selected
        ? { url: threeorod.selected.offerUrl, end: threeorod.selected.end_date }
        : null,
    };

    const s = selected;
    const active = isActive(s.start_date, s.end_date) ? 'ACTIVE' : 'STALE';
    console.log(
      `${active} via ${s.reason} — ${s.start_date ?? '?'} → ${s.end_date ?? '?'} — ${(s.title_en ?? '').slice(0, 48)}`,
    );
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
  console.log(`${slug}: ${s.reason} | ${s.start_date} → ${s.end_date}`);
  console.log(`  ${s.fullflyerUrl ?? s.offerUrl}`);
}

if (write) {
  for (const [slug, result] of Object.entries(discovered)) {
    if (result.error || !result.selected) continue;
    const prev = sources.stores[slug] ?? {};
    sources.stores[slug] = toStoreRecord(slug, prev, result.selected);
  }
  sources.attribution =
    'Weekly flyer images from FullFlyer/ilofo when current; otherwise 3orod.net store weeklies. Product grid prices remain illustrative until retailer feeds are connected.';
  sources.discoveredAt = new Date().toISOString();
  await fs.writeFile(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`);
  console.log(`\nWrote ${sourcesPath}`);
}

const stale = Object.entries(discovered).filter(
  ([, r]) => r.selected && isExpired(r.selected.end_date),
);
if (stale.length) {
  console.log('\nStale after discovery:', stale.map(([s]) => s).join(', '));
}
