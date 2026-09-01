/** Local demo data used when Hasura is unavailable (no Docker). */

export { mockCategories, mockSupermarkets } from '../data/catalog';
import { mockProducts as catalogProducts, mockSupermarkets } from '../data/catalog';
import { leafletManifest } from '../data/leafletManifest';
import { getLeafletHotspots, leafletProductsForStore } from '../data/leafletHotspots';
import { supermarketShortName } from '../utils/supermarketBranding';

/** Base catalog plus products tagged from weekly leaflet hotspots (e.g. Panda page 1). */
export const mockProducts = [
  ...catalogProducts,
  ...mockSupermarkets.flatMap((store) => leafletProductsForStore(store.slug, store)),
];

export function searchMockProducts(pattern: string, limit = 20) {  const needle = pattern.replace(/%/g, '').trim().toLowerCase();
  if (!needle) return mockProducts.slice(0, limit);
  return mockProducts
    .filter((p) => {
      const hay = [
        p.name_en,
        p.name_ar,
        p.brand?.name_en,
        p.brand?.name_ar,
        p.category?.slug,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    })
    .slice(0, limit);
}

export function getMockBestDeals(limit = 8) {
  return mockProducts
    .flatMap((p) =>
      p.offers.map((o) => ({
        id: o.id,
        offer_price: o.offer_price,
        regular_price: o.regular_price,
        is_demo: o.is_demo,
        product: {
          id: p.id,
          name_en: p.name_en,
          name_ar: p.name_ar,
          size_value: p.size_value,
          size_unit: p.size_unit,
          brand: p.brand,
        },
        supermarket: o.supermarket,
      })),
    )
    .sort((a, b) => a.offer_price - b.offer_price)
    .slice(0, limit);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function thisWeekRange() {
  const today = new Date();
  const start = new Date(today);
  const day = today.getDay();
  const daysSinceSaturday = (day + 1) % 7;
  start.setDate(today.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: isoDate(start), end: isoDate(end), today: isoDate(today) };
}

type ManifestStore = {
  officialUrl?: string;
  fullflyerUrl?: string;
  title_en?: string;
  title_ar?: string;
  start_date?: string;
  end_date?: string;
  pages?: Array<{ page_number: number; image_url: string }>;
};

function leafletPagesFromManifest(slug: string, leafletId: string, fallbackCount = 3) {
  const store = (leafletManifest.stores as Record<string, ManifestStore>)[slug];
  const pages = store?.pages?.length ? store.pages : null;
  if (pages?.length) {
    return pages.map((p) => ({
      id: `${leafletId}-page-${p.page_number}`,
      page_number: p.page_number,
      image_url: p.image_url,
      processing_status: 'ready',
      hotspots: getLeafletHotspots(slug, p.page_number),
    }));
  }
  return Array.from({ length: fallbackCount }, (_, i) => ({
    id: `${leafletId}-page-${i + 1}`,
    page_number: i + 1,
    image_url: `/leaflets/${slug}/page-${i + 1}.svg`,
    processing_status: 'ready',
    hotspots: getLeafletHotspots(slug, i + 1),
  }));
}

export function getMockCurrentLeaflets() {
  const week = thisWeekRange();

  const seeded = mockSupermarkets.map((store, index) => {
    const leafletId = `66666666-6666-6666-6666-6666666660${String(index + 1).padStart(2, '0')}`;
    const manifestStore = (leafletManifest.stores as Record<string, ManifestStore>)[store.slug];
    const shortEn = supermarketShortName(store, 'en');
    const shortAr = supermarketShortName(store, 'ar');

    const storeOffers = mockProducts
      .flatMap((p) =>
        p.offers
          .filter((o) => o.supermarket.id === store.id)
          .map((o) => ({
            id: o.id,
            offer_price: o.offer_price,
            regular_price: o.regular_price,
            effective_price: o.effective_price,
            currency: o.currency,
            is_demo: o.is_demo,
            promotion_description_en: o.promotion_description_en ?? 'Weekly offer',
            promotion_description_ar: o.promotion_description_ar ?? 'عرض الأسبوع',
            product: {
              id: p.id,
              name_en: p.name_en,
              name_ar: p.name_ar,
              size_value: p.size_value,
              size_unit: p.size_unit,
              image_url: p.image_url,
              package_description_en: p.package_description_en,
              package_description_ar: p.package_description_ar,
              brand: p.brand,
            },
          })),
      )
      .sort((a, b) => a.offer_price - b.offer_price);

    const pages = leafletPagesFromManifest(store.slug, leafletId);
    const firstPage = pages[0]?.image_url ?? `/leaflets/${store.slug}/page-1.svg`;

    return {
      id: leafletId,
      title_en: manifestStore?.title_en ?? `${shortEn} weekly leaflet`,
      title_ar: manifestStore?.title_ar ?? `نشرة ${shortAr} الأسبوعية`,
      start_date: manifestStore?.start_date ?? week.start,
      end_date: manifestStore?.end_date ?? week.end,
      city: 'Riyadh',
      status: 'published',
      source_url: manifestStore?.officialUrl ?? manifestStore?.fullflyerUrl ?? null,
      original_file_url: firstPage,
      supermarket: store,
      pages,
      offers: storeOffers,
    };
  });

  try {
    const raw = localStorage.getItem('wain-awfar.published-leaflets');
    if (!raw) return seeded;
    const parsed = JSON.parse(raw) as { leaflets?: typeof seeded };
    const overlay = Array.isArray(parsed.leaflets) ? parsed.leaflets : [];
    if (!overlay.length) return seeded;
    return mockSupermarkets.map((store) => {
      const published = overlay.find((l) => l.supermarket?.id === store.id);
      return published ?? seeded.find((l) => l.supermarket.id === store.id)!;
    });
  } catch {
    return seeded;
  }
}
