import { normalizeProductName } from './normalization';

export type CatalogProduct = {
  id: string;
  name_en: string;
  name_ar: string;
  size_value?: number | null;
  size_unit?: string | null;
  image_url?: string | null;
  package_description_en?: string | null;
  package_description_ar?: string | null;
  brand?: { name_en: string; name_ar: string } | null;
  offers?: Array<{
    supermarket: { id: string; slug: string };
  }>;
};

export type OfferBlock = {
  rawText: string;
  productName?: string;
  brand?: string;
  size?: string;
  unit?: string;
  regularPrice?: number;
  offerPrice?: number;
  promotion?: string;
};

export type MatchedOffer = {
  offerBlock: OfferBlock;
  product: CatalogProduct | null;
  matchScore: number;
  offer_price: number;
  regular_price?: number | null;
};

export type IngestDraft = {
  id: string;
  supermarket: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    logo_url?: string | null;
  };
  title_en: string;
  title_ar: string;
  start_date: string;
  end_date: string;
  city: string;
  status: 'needs_review' | 'published';
  source_url?: string | null;
  original_file_url?: string | null;
  pages: Array<{
    id: string;
    page_number: number;
    image_url?: string | null;
    processing_status: string;
  }>;
  matches: MatchedOffer[];
  processed_at: string;
};

const PUBLISHED_KEY = 'wain-awfar.published-leaflets';

/** Deterministic mock OCR blocks per store — simulates reading a weekly leaflet. */
export function mockExtractOfferBlocks(storeSlug: string): OfferBlock[] {
  if (storeSlug === 'lulu') {
    return [
      {
        rawText: 'Almarai Full Fat Milk 2L 10.50',
        productName: 'Almarai Full Fat Milk',
        brand: 'Almarai',
        size: '2',
        unit: 'L',
        regularPrice: 12.5,
        offerPrice: 10.5,
        promotion: 'Weekly leaflet special',
      },
      {
        rawText: 'Noor Sunflower Oil 1.5L 23.50',
        productName: 'Noor Sunflower Oil',
        brand: 'Noor',
        size: '1.5',
        unit: 'L',
        regularPrice: 27.95,
        offerPrice: 23.5,
        promotion: 'Price drop',
      },
      {
        rawText: 'Basmati Rice 10kg 36.50',
        productName: 'Basmati Rice',
        brand: 'Al Shalan',
        size: '10',
        unit: 'kg',
        regularPrice: 41,
        offerPrice: 36.5,
        promotion: 'Weekly offer',
      },
      {
        rawText: 'Signal Toothpaste 100g 9.25',
        productName: 'Signal Toothpaste',
        brand: 'Signal',
        size: '100',
        unit: 'g',
        regularPrice: 10.95,
        offerPrice: 9.25,
        promotion: 'Care deals',
      },
      {
        rawText: 'Fresh Eggs 30 21.50',
        productName: 'Fresh Eggs',
        brand: 'Generic',
        size: '30',
        unit: 'piece',
        regularPrice: 24.95,
        offerPrice: 21.5,
        promotion: 'Fresh',
      },
    ];
  }

  return [
    {
      rawText: 'Almarai Full Fat Milk 2L 9.95',
      productName: 'Almarai Full Fat Milk',
      brand: 'Almarai',
      size: '2',
      unit: 'L',
      regularPrice: 12.95,
      offerPrice: 9.95,
      promotion: 'Weekly leaflet special',
    },
    {
      rawText: 'Afia Sunflower Oil 1.5L 27.95',
      productName: 'Afia Sunflower Oil',
      brand: 'Afia',
      size: '1.5',
      unit: 'L',
      regularPrice: 29.95,
      offerPrice: 27.95,
      promotion: 'Pantry deal',
    },
    {
      rawText: 'Basmati Rice 10kg 34.95',
      productName: 'Basmati Rice',
      brand: 'Al Shalan',
      size: '10',
      unit: 'kg',
      regularPrice: 39.95,
      offerPrice: 34.95,
      promotion: 'Weekly offer',
    },
    {
      rawText: 'Tide Automatic 5kg 41.50',
      productName: 'Tide Automatic',
      brand: 'Tide',
      size: '5',
      unit: 'kg',
      regularPrice: 48,
      offerPrice: 41.5,
      promotion: 'Cleaning',
    },
    {
      rawText: 'Signal Toothpaste 100g 8.75',
      productName: 'Signal Toothpaste',
      brand: 'Signal',
      size: '100',
      unit: 'g',
      regularPrice: 10.95,
      offerPrice: 8.75,
      promotion: 'Care',
    },
  ];
}

export function scoreProductMatch(product: CatalogProduct, block: OfferBlock): number {
  const blob = normalizeProductName(
    [product.name_en, product.name_ar, product.brand?.name_en, product.brand?.name_ar]
      .filter(Boolean)
      .join(' '),
  );
  let score = 0;
  const name = normalizeProductName(block.productName ?? '');
  const brand = normalizeProductName(block.brand ?? '');

  if (name && blob.includes(name)) score += 40;
  else if (name) {
    for (const part of name.split(' ').filter((p) => p.length > 2)) {
      if (blob.includes(part)) score += 12;
    }
  }
  if (brand && blob.includes(brand)) score += 25;
  if (block.size && String(product.size_value ?? '') === String(block.size)) score += 10;
  if (block.unit && normalizeProductName(product.size_unit ?? '') === normalizeProductName(block.unit)) {
    score += 8;
  }
  return score;
}

export function matchOfferBlocks(
  blocks: OfferBlock[],
  catalog: CatalogProduct[],
): MatchedOffer[] {
  return blocks.map((block) => {
    const ranked = catalog
      .map((product) => ({ product, matchScore: scoreProductMatch(product, block) }))
      .filter((x) => x.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore);
    const best = ranked[0];
    return {
      offerBlock: block,
      product: best?.product ?? null,
      matchScore: best?.matchScore ?? 0,
      offer_price: block.offerPrice ?? 0,
      regular_price: block.regularPrice ?? null,
    };
  });
}

export function buildIngestDraft(params: {
  supermarket: IngestDraft['supermarket'];
  start_date: string;
  end_date: string;
  city?: string;
  catalog: CatalogProduct[];
  pageUrls?: string[];
  source_url?: string | null;
}): IngestDraft {
  const blocks = mockExtractOfferBlocks(params.supermarket.slug);
  const matches = matchOfferBlocks(blocks, params.catalog);
  const shortEn =
    params.supermarket.slug === 'lulu'
      ? 'LuLu'
      : params.supermarket.slug === 'carrefour'
        ? 'Carrefour'
        : params.supermarket.name_en;
  const shortAr =
    params.supermarket.slug === 'lulu'
      ? 'لولو'
      : params.supermarket.slug === 'carrefour'
        ? 'كارفور'
        : params.supermarket.name_ar;
  const id = `ingest-${params.supermarket.slug}-${Date.now()}`;
  const pageUrls =
    params.pageUrls?.length
      ? params.pageUrls
      : [1, 2, 3].map((n) => `/leaflets/${params.supermarket.slug}/page-${n}.svg`);

  return {
    id,
    supermarket: params.supermarket,
    title_en: `${shortEn} weekly leaflet`,
    title_ar: `نشرة ${shortAr} الأسبوعية`,
    start_date: params.start_date,
    end_date: params.end_date,
    city: params.city ?? 'Riyadh',
    status: 'needs_review',
    source_url: params.source_url ?? null,
    original_file_url: pageUrls[0] ?? null,
    pages: pageUrls.map((image_url, index) => ({
      id: `${id}-page-${index + 1}`,
      page_number: index + 1,
      image_url,
      processing_status: 'ready',
    })),
    matches,
    processed_at: new Date().toISOString(),
  };
}

export function draftToPublishedLeaflet(draft: IngestDraft) {
  const matched = draft.matches.filter((m) => m.product && m.offer_price > 0);
  return {
    id: draft.id,
    title_en: draft.title_en,
    title_ar: draft.title_ar,
    start_date: draft.start_date,
    end_date: draft.end_date,
    city: draft.city,
    status: 'published' as const,
    source_url: draft.source_url,
    original_file_url: draft.original_file_url,
    supermarket: draft.supermarket,
    pages: draft.pages,
    offers: matched.map((m, index) => ({
      id: `${draft.id}-offer-${index + 1}`,
      offer_price: m.offer_price,
      regular_price: m.regular_price,
      effective_price: m.offer_price,
      currency: 'SAR',
      is_demo: true,
      promotion_description_en: m.offerBlock.promotion ?? 'Weekly offer',
      promotion_description_ar: 'عرض الأسبوع',
      product: {
        id: m.product!.id,
        name_en: m.product!.name_en,
        name_ar: m.product!.name_ar,
        size_value: m.product!.size_value,
        size_unit: m.product!.size_unit,
        image_url: m.product!.image_url,
        package_description_en: m.product!.package_description_en,
        package_description_ar: m.product!.package_description_ar,
        brand: m.product!.brand,
      },
    })),
    ingested_at: draft.processed_at,
  };
}

export type PublishedLeaflet = ReturnType<typeof draftToPublishedLeaflet>;

export function readPublishedLeaflets(): PublishedLeaflet[] {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { leaflets?: PublishedLeaflet[] };
    return Array.isArray(parsed.leaflets) ? parsed.leaflets : [];
  } catch {
    return [];
  }
}

export function publishLeafletLocally(draft: IngestDraft): PublishedLeaflet {
  const published = draftToPublishedLeaflet({ ...draft, status: 'published' });
  const existing = readPublishedLeaflets().filter(
    (l) => l.supermarket.id !== draft.supermarket.id,
  );
  const next = [...existing, published];
  localStorage.setItem(
    PUBLISHED_KEY,
    JSON.stringify({ leaflets: next, updatedAt: new Date().toISOString() }),
  );
  return published;
}

export function clearPublishedLeaflets() {
  localStorage.removeItem(PUBLISHED_KEY);
}

export type FreshnessReport = {
  checkedAt: string;
  stores: Array<{
    slug: string;
    name_en: string;
    hasPublishedLeaflet: boolean;
    end_date?: string;
    daysRemaining?: number;
    offerCount?: number;
    stale: boolean;
  }>;
};

export function computeFreshness(
  stores: Array<{ slug: string; name_en: string; id: string }>,
  leaflets: PublishedLeaflet[],
  todayIso = new Date().toISOString().slice(0, 10),
): FreshnessReport {
  const today = new Date(todayIso);
  return {
    checkedAt: new Date().toISOString(),
    stores: stores.map((store) => {
      const leaflet = leaflets.find((l) => l.supermarket.id === store.id || l.supermarket.slug === store.slug);
      if (!leaflet) {
        return {
          slug: store.slug,
          name_en: store.name_en,
          hasPublishedLeaflet: false,
          stale: true,
        };
      }
      const end = new Date(leaflet.end_date);
      const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / 86400000);
      return {
        slug: store.slug,
        name_en: store.name_en,
        hasPublishedLeaflet: true,
        end_date: leaflet.end_date,
        daysRemaining,
        offerCount: leaflet.offers.length,
        stale: daysRemaining < 0,
      };
    }),
  };
}

export function thisWeekRange(base = new Date()) {
  const start = new Date(base);
  const day = start.getDay();
  const daysSinceSaturday = (day + 1) % 7;
  start.setDate(start.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), today: iso(base) };
}
