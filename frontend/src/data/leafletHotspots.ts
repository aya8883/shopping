/**
 * Leaflet offer hotspots — percentage-based click regions on flyer pages.
 * Each hotspot links to a canonical productId (what the customer wants),
 * not a store-specific SKU.
 */

import { mockSupermarkets } from './catalog';
import { storeProductImageUrl } from './storeProductImages';
import { weeklyOfferFor } from './weeklyOffers';

export type CanonicalProduct = {
  id: string;
  name_en: string;
  name_ar: string;
  brand_en?: string;
  brand_ar?: string;
  size_value: number;
  size_unit: string;
  unit_label_en: string;
  unit_label_ar: string;
  category_slug: string;
  image_url?: string;
};

export const CANONICAL_PRODUCTS: CanonicalProduct[] = [
  { id: 'banana-1kg', name_en: 'Banana', name_ar: 'موز', size_value: 1, size_unit: 'kg', unit_label_en: '1 kg', unit_label_ar: '1 كجم', category_slug: 'fruits-vegetables', image_url: '/products/eggs.svg' },
  { id: 'tomato-1kg', name_en: 'Tomato', name_ar: 'طماطم', size_value: 1, size_unit: 'kg', unit_label_en: '1 kg', unit_label_ar: '1 كجم', category_slug: 'fruits-vegetables', image_url: '/products/eggs.svg' },
  { id: 'veal-1kg', name_en: 'Local Veal Boneless', name_ar: 'عجل محلي بدون عظم', size_value: 1, size_unit: 'kg', unit_label_en: 'per kg', unit_label_ar: 'بالكيلو', category_slug: 'meat-poultry', image_url: '/products/eggs.svg' },
  { id: 'sadia-chicken-1300g-x3', name_en: 'Sadia Frozen Chicken 1300g x3', name_ar: 'دجاج ساديا مجمد 1300جم ×3', brand_en: 'Sadia', brand_ar: 'ساديا', size_value: 3, size_unit: 'piece', unit_label_en: '3×1300g', unit_label_ar: '3×1300 جم', category_slug: 'frozen-food', image_url: '/products/eggs.svg' },
  { id: 'eggs-30', name_en: 'Fresh Eggs 30 Pack', name_ar: 'بيض طازج 30', size_value: 30, size_unit: 'piece', unit_label_en: '30 eggs', unit_label_ar: '30 بيضة', category_slug: 'dairy', image_url: '/products/eggs.svg' },
  { id: 'nadec-cheese-500g-x2', name_en: 'Nadec Cheese Cream Spread 500g x2', name_ar: 'جبنة نادك كريمية 500جم ×2', brand_en: 'Nadec', brand_ar: 'نادك', size_value: 2, size_unit: 'piece', unit_label_en: '2×500g', unit_label_ar: '2×500 جم', category_slug: 'dairy', image_url: '/products/milk.svg' },
  { id: 'cornflakes-1kg', name_en: "Kellogg's Corn Flakes 1kg", name_ar: 'كورن فلكس 1كجم', brand_en: "Kellogg's", brand_ar: 'كيلogg\'s', size_value: 1, size_unit: 'kg', unit_label_en: '1 kg', unit_label_ar: '1 كجم', category_slug: 'rice-grains', image_url: '/products/rice.svg' },
  { id: 'basmati-rice-10kg', name_en: 'Basmati Rice 10kg', name_ar: 'أرز بسمتي 10كجم', size_value: 10, size_unit: 'kg', unit_label_en: '10 kg', unit_label_ar: '10 كجم', category_slug: 'rice-grains', image_url: '/products/rice.svg' },
  { id: 'anchor-milk-powder-1.8kg', name_en: 'Anchor Milk Powder 1.8kg', name_ar: 'حليب Anchor بودرة 1.8كجم', brand_en: 'Anchor', brand_ar: 'Anchor', size_value: 1.8, size_unit: 'kg', unit_label_en: '1.8 kg', unit_label_ar: '1.8 كجم', category_slug: 'dairy', image_url: '/products/milk.svg' },
];

export function getCanonicalProduct(id: string): CanonicalProduct | undefined {
  return CANONICAL_PRODUCTS.find((p) => p.id === id);
}

export const CANONICAL_STORE_PRICES: Record<string, Record<string, { price: number; oldPrice?: number | null }>> = {
  'banana-1kg': { carrefour: { price: 4.99, oldPrice: 6.95 }, panda: { price: 4.5, oldPrice: 5.99 }, danube: { price: 5.75, oldPrice: 6.5 }, othaim: { price: 5.25 }, lulu: { price: 5.1 }, tamimi: { price: 5.5 } },
  'tomato-1kg': { carrefour: { price: 3.99 }, panda: { price: 3.99 }, danube: { price: 3.49 }, othaim: { price: 4.1 }, lulu: { price: 3.75 }, tamimi: { price: 4.5 } },
  'eggs-30': { carrefour: { price: 17.95, oldPrice: 19.95 }, panda: { price: 12.99, oldPrice: 22.95 }, danube: { price: 15.5 }, othaim: { price: 14.95 }, lulu: { price: 15.95, oldPrice: 18.95 }, tamimi: { price: 16.25 } },
  'basmati-rice-10kg': { carrefour: { price: 69.95, oldPrice: 79.95 }, panda: { price: 54.99, oldPrice: 95 }, danube: { price: 72.5 }, othaim: { price: 68.0 }, lulu: { price: 74.95 }, tamimi: { price: 71.0 } },
  'veal-1kg': { panda: { price: 52.99 } },
  'sadia-chicken-1300g-x3': { panda: { price: 39.99, oldPrice: 61.5 } },
  'nadec-cheese-500g-x2': { panda: { price: 17.99, oldPrice: 31.9 } },
  'cornflakes-1kg': { panda: { price: 22.99, oldPrice: 43.95 } },
  'anchor-milk-powder-1.8kg': { panda: { price: 39.99, oldPrice: 104.5 } },
};

export type StorePriceQuote = {
  supermarketSlug: string;
  supermarketNameEn: string;
  supermarketNameAr: string;
  price: number;
  oldPrice?: number | null;
};

export type LeafletOfferHotspot = {
  id: string;
  /** Canonical product id e.g. banana-1kg */
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  oldPrice?: number | null;
  unit: string;
  unitAr: string;
  supermarket: string;
  /** Position inside leaflet image (% of width/height) */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LeafletHotspotPage = {
  page_number: number;
  hotspots: LeafletOfferHotspot[];
};

const HOTSPOT_STORAGE_KEY = 'wain-awfar.leaflet-hotspots';

function gridCell(
  productId: string,
  supermarket: string,
  price: number,
  oldPrice: number | null,
  x: number,
  y: number,
  width: number,
  height: number,
): LeafletOfferHotspot {
  const canonical = getCanonicalProduct(productId)!;
  return {
    id: `${supermarket}-offer-${productId}`,
    productId,
    name: canonical.name_en,
    nameAr: canonical.name_ar,
    price,
    oldPrice,
    unit: canonical.unit_label_en,
    unitAr: canonical.unit_label_ar,
    supermarket,
    x,
    y,
    width,
    height,
  };
}

/** Panda weekly page 1 — 3×3 grid (manual annotation MVP) */
const PANDA_PAGE1: LeafletOfferHotspot[] = [
  gridCell('veal-1kg', 'panda', 52.99, null, 1, 11, 31, 28),
  gridCell('tomato-1kg', 'panda', 3.99, null, 34, 11, 31, 28),
  gridCell('banana-1kg', 'panda', 4.99, null, 67, 11, 31, 28),
  gridCell('sadia-chicken-1300g-x3', 'panda', 39.99, 61.5, 1, 39, 31, 28),
  gridCell('eggs-30', 'panda', 12.99, 22.95, 34, 39, 31, 28),
  gridCell('nadec-cheese-500g-x2', 'panda', 17.99, 31.9, 67, 39, 31, 28),
  gridCell('cornflakes-1kg', 'panda', 22.99, 43.95, 1, 67, 31, 28),
  gridCell('basmati-rice-10kg', 'panda', 54.99, 95, 34, 67, 31, 28),
  gridCell('anchor-milk-powder-1.8kg', 'panda', 39.99, 104.5, 67, 67, 31, 28),
];

const STATIC_HOTSPOTS: Record<string, LeafletHotspotPage[]> = {
  panda: [{ page_number: 1, hotspots: PANDA_PAGE1 }],
};

type StoredHotspots = Record<string, LeafletHotspotPage[]>;

function readStoredHotspots(): StoredHotspots {
  try {
    const raw = localStorage.getItem(HOTSPOT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredHotspots;
  } catch {
    return {};
  }
}

export function saveHotspots(storeSlug: string, pages: LeafletHotspotPage[]) {
  const all = readStoredHotspots();
  all[storeSlug] = pages;
  localStorage.setItem(HOTSPOT_STORAGE_KEY, JSON.stringify(all));
}

export function getLeafletHotspots(storeSlug: string, pageNumber: number): LeafletOfferHotspot[] {
  const staticPage = STATIC_HOTSPOTS[storeSlug]?.find((p) => p.page_number === pageNumber);
  const storedPage = readStoredHotspots()[storeSlug]?.find((p) => p.page_number === pageNumber);
  const merged = new Map<string, LeafletOfferHotspot>();
  for (const h of staticPage?.hotspots ?? []) merged.set(h.productId, h);
  for (const h of storedPage?.hotspots ?? []) merged.set(h.productId, h);
  return Array.from(merged.values());
}

/** @deprecated use LeafletOfferHotspot */
export type LeafletHotspot = LeafletOfferHotspot;

export function quotesForProduct(productId: string): StorePriceQuote[] {
  const prices = CANONICAL_STORE_PRICES[productId];
  if (!prices) return [];
  return Object.entries(prices)
    .map(([slug, p]) => {
      const store = mockSupermarkets.find((s) => s.slug === slug);
      if (!store) return null;
      return {
        supermarketSlug: slug,
        supermarketNameEn: store.name_en,
        supermarketNameAr: store.name_ar,
        price: p.price,
        oldPrice: p.oldPrice,
      };
    })
    .filter(Boolean) as StorePriceQuote[];
}

export function bestPriceQuote(
  productId: string,
  excludeSlug?: string,
): StorePriceQuote | null {
  const sorted = quotesForProduct(productId)
    .filter((q) => q.supermarketSlug !== excludeSlug)
    .sort((a, b) => a.price - b.price);
  return sorted[0] ?? null;
}

export function savingsVsStore(
  productId: string,
  currentSlug: string,
  currentPrice: number,
): { best: StorePriceQuote; savings: number } | null {
  const best = bestPriceQuote(productId, undefined);
  if (!best || best.supermarketSlug === currentSlug) return null;
  if (best.price >= currentPrice) return null;
  return { best, savings: currentPrice - best.price };
}

/** Build mock catalog entries from canonical products + cross-store prices. */
export function canonicalProductsForCatalog() {
  return Object.entries(CANONICAL_STORE_PRICES).flatMap(([productId, byStore]) => {
    const canonical = getCanonicalProduct(productId);
    if (!canonical) return [];

    const offers = Object.entries(byStore)
      .map(([slug, pricing]) => {
        const store = mockSupermarkets.find((s) => s.slug === slug);
        if (!store) return null;
        const flyer = weeklyOfferFor(productId, slug);
        const offer_price = flyer?.offer_price ?? pricing.price;
        const regular_price =
          flyer?.regular_price ?? pricing.oldPrice ?? pricing.price;
        return {
          id: `canonical-offer-${productId}-${slug}`,
          offer_price,
          regular_price,
          effective_price: offer_price,
          display_price: offer_price,
          unit_price: null,
          unit_price_unit: null,
          promotion_type: 'leaflet_offer',
          promotion_description_en: flyer?.promotion_en ?? 'Weekly offer',
          promotion_description_ar: flyer?.promotion_ar ?? 'عرض الأسبوع',
          minimum_quantity: 1,
          currency: 'SAR',
          city: 'Riyadh',
          is_demo: false,
          start_date: '2026-08-26',
          end_date: '2026-09-08',
          image_url: storeProductImageUrl(productId, slug, canonical.image_url),
          supermarket: store,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry != null);

    if (!offers.length) return [];

    return [
      {
        id: productId,
        name_en: canonical.name_en,
        name_ar: canonical.name_ar,
        size_value: canonical.size_value,
        size_unit: canonical.size_unit,
        package_description_en: canonical.unit_label_en,
        package_description_ar: canonical.unit_label_ar,
        variant_en: canonical.brand_en ?? '',
        variant_ar: canonical.brand_ar ?? '',
        image_url: storeProductImageUrl(productId, 'carrefour', canonical.image_url),
        price_basis: canonical.size_unit === 'kg' ? 'kg' : 'package',
        brand: {
          id: `brand-${productId}`,
          name_en: canonical.brand_en ?? 'Generic',
          name_ar: canonical.brand_ar ?? 'عام',
        },
        category: {
          id: '33333333-3333-3333-3333-333333333014',
          name_en: 'Weekly offers',
          name_ar: 'عروض الأسبوع',
          slug: canonical.category_slug,
        },
        offers,
      },
    ];
  });
}

