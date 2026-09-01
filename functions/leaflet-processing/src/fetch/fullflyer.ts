export type ParsedCatalogPage = {
  page_number: number;
  image_url: string;
};

export type ParsedCatalog = {
  catalog_id: string;
  source_url: string;
  title_en?: string;
  start_date?: string;
  end_date?: string;
  page_count: number;
  pages: ParsedCatalogPage[];
};

const CDN = 'https://cdn.ilofo.com';

function decodeHtml(s: string): string {
  return s.replace(/&amp;/g, '&');
}

/** Extract high-res leaflet page URLs from a FullFlyer catalog HTML page. */
export function parseFullFlyerCatalogHtml(html: string, sourceUrl: string): ParsedCatalog {
  const catalogId =
    sourceUrl.match(/catalogs\/(\d+)-pdf/i)?.[1] ??
    html.match(/catalogs\/img\/(\d+)\//)?.[1] ??
    'unknown';

  const title =
    html.match(/<h1[^>]*>([^<]+)</i)?.[1]?.trim() ??
    html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1]?.trim();

  const startIso = html.match(/Start date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  const endIso = html.match(/End date<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1]?.trim();

  const hiRes = [
    ...html.matchAll(
      new RegExp(
        `cdn\\.ilofo\\.com/storage/catalogs/img/${catalogId}/([^"'\\s]+?)\\.(jpg|jpeg|png|webp)\\?w=1600`,
        'gi',
      ),
    ),
  ].map((m) => ({
    key: `${m[1]}.${m[2].toLowerCase()}`,
    url: decodeHtml(`https://cdn.ilofo.com/storage/catalogs/img/${catalogId}/${m[1]}.${m[2]}?w=1600&h=1600`),
  }));

  const byKey = new Map<string, string>();
  for (const item of hiRes) byKey.set(item.key, item.url);

  const suffixPages: ParsedCatalogPage[] = [];
  const uniqueHashes: string[] = [];

  for (const key of byKey.keys()) {
    const suffixMatch = key.match(/^([a-f0-9]+)-(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (suffixMatch) {
      suffixPages.push({
        page_number: Number(suffixMatch[2]) + 1,
        image_url: byKey.get(key)!,
      });
    } else {
      uniqueHashes.push(key);
    }
  }

  let pages: ParsedCatalogPage[];
  if (suffixPages.length) {
    pages = suffixPages.sort((a, b) => a.page_number - b.page_number);
  } else {
    pages = uniqueHashes.map((key, index) => ({
      page_number: index + 1,
      image_url: byKey.get(key)!,
    }));
  }

  const declaredCount = html.match(/No\. of pages<\/td>\s*<td[^>]*>\s*(\d+)/i)?.[1];

  return {
    catalog_id: catalogId,
    source_url: sourceUrl,
    title_en: title,
    start_date: startIso ? parseDisplayDate(startIso) : undefined,
    end_date: endIso ? parseDisplayDate(endIso) : undefined,
    page_count: declaredCount ? Number(declaredCount) : pages.length,
    pages,
  };
}

function parseDisplayDate(raw: string): string | undefined {
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return undefined;
}

export async function fetchFullFlyerCatalog(catalogUrl: string): Promise<ParsedCatalog> {
  const res = await fetch(catalogUrl, {
    headers: { 'User-Agent': 'WainAwfar/1.0 leaflet-sync' },
  });
  if (!res.ok) throw new Error(`fullflyer_fetch_failed:${res.status}`);
  const html = await res.text();
  return parseFullFlyerCatalogHtml(html, catalogUrl);
}

export function sliceCatalogPages(catalog: ParsedCatalog, maxPages = 6): ParsedCatalogPage[] {
  return catalog.pages.slice(0, maxPages);
}
