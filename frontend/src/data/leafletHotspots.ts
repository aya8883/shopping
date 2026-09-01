/** Click regions on leaflet page images (% of width/height). Populated from OCR / manual tagging. */

export type LeafletHotspotProduct = {
  id: string;
  name_en: string;
  name_ar: string;
  brand_en?: string;
  brand_ar?: string;
  size_value?: number | null;
  size_unit?: string | null;
  package_description_en?: string;
  package_description_ar?: string;
  image_url?: string | null;
};

export type LeafletHotspot = {
  id: string;
  /** Left edge, 0–100 */
  x: number;
  /** Top edge, 0–100 */
  y: number;
  /** Width, 0–100 */
  w: number;
  /** Height, 0–100 */
  h: number;
  offer_price: number;
  regular_price?: number | null;
  promotion_description_en?: string;
  promotion_description_ar?: string;
  product: LeafletHotspotProduct;
};

export type LeafletHotspotPage = {
  page_number: number;
  hotspots: LeafletHotspot[];
};

/** 3×3 product grid on Panda Back to School weekly page 1 */
const PANDA_PAGE1: LeafletHotspot[] = [
  hs(1, 0, 0, 'Local Veal Boneless', 'عجل محلي بدون عظم', 'Generic', 'محلي', 1, 'kg', 52.99, null, 1, 33, 11, 28),
  hs(2, 1, 0, 'Tomato', 'طماطم', 'Generic', 'سعودي', 1, 'kg', 3.99, null, 34, 33, 11, 28),
  hs(3, 2, 0, 'Banana', 'موز', 'Generic', 'إكوادور', 1, 'kg', 4.99, null, 67, 33, 11, 28),
  hs(4, 0, 1, 'Sadia Frozen Chicken 1300g x3', 'دجاج ساديا مجمد 1300جم ×3', 'Sadia', 'ساديا', 3, 'piece', 39.99, 61.5, 1, 33, 39, 28),
  hs(5, 1, 1, 'Bee Farm Eggs (30)', 'بيض Bee Farm (30)', 'Bee Farm', 'Bee Farm', 30, 'piece', 12.99, 22.95, 34, 33, 39, 28),
  hs(6, 2, 1, 'Nadec Cheese Cream Spread 500g x2', 'جبنة نادك كريمية 500جم ×2', 'Nadec', 'نادك', 2, 'piece', 17.99, 31.9, 67, 33, 39, 28),
  hs(7, 0, 2, "Kellogg's Corn Flakes 1kg", 'كورن فلكس كيلogg\'s 1كجم', "Kellogg's", 'كيلogg\'s', 1, 'kg', 22.99, 43.95, 1, 33, 67, 28),
  hs(8, 1, 2, 'Rice King Sella Basmati 10kg', 'أرز Rice King سيلا بسمتي 10كجم', 'Rice King', 'Rice King', 10, 'kg', 54.99, 95, 34, 33, 67, 28),
  hs(9, 2, 2, 'Anchor Milk Powder 1.8kg', 'حليب Anchor بودرة 1.8كجم', 'Anchor', 'Anchor', 1.8, 'kg', 39.99, 104.5, 67, 33, 67, 28),
];

function hs(
  index: number,
  col: number,
  row: number,
  nameEn: string,
  nameAr: string,
  brandEn: string,
  brandAr: string,
  sizeValue: number,
  sizeUnit: string,
  offerPrice: number,
  regularPrice: number | null,
  xOverride?: number,
  wOverride?: number,
  yOverride?: number,
  hOverride?: number,
): LeafletHotspot {
  const colW = wOverride ?? 31;
  const rowH = hOverride ?? 28;
  const x = xOverride ?? 1 + col * 33;
  const y = yOverride ?? 11 + row * 28;
  const pkgEn = sizeUnit === 'kg' && sizeValue === 1 ? 'per kg' : `${sizeValue}${sizeUnit}`;
  const pkgAr = sizeUnit === 'kg' && sizeValue === 1 ? 'بالكيلو' : `${sizeValue} ${sizeUnit}`;

  return {
    id: `panda-p1-${index}`,
    x,
    y,
    w: colW,
    h: rowH,
    offer_price: offerPrice,
    regular_price: regularPrice,
    promotion_description_en: 'Panda weekly offer',
    promotion_description_ar: 'عرض بنده الأسبوعي',
    product: {
      id: `77777777-7777-7777-7777-7777777770${String(index).padStart(2, '0')}`,
      name_en: nameEn,
      name_ar: nameAr,
      brand_en: brandEn,
      brand_ar: brandAr,
      size_value: sizeValue,
      size_unit: sizeUnit,
      package_description_en: pkgEn,
      package_description_ar: pkgAr,
      image_url: '/products/milk.svg',
    },
  };
}

const HOTSPOTS: Record<string, LeafletHotspotPage[]> = {
  panda: [{ page_number: 1, hotspots: PANDA_PAGE1 }],
};

export function getLeafletHotspots(storeSlug: string, pageNumber: number): LeafletHotspot[] {
  const pages = HOTSPOTS[storeSlug];
  if (!pages) return [];
  return pages.find((p) => p.page_number === pageNumber)?.hotspots ?? [];
}

export function allLeafletHotspotProducts(storeSlug: string): LeafletHotspot[] {
  const pages = HOTSPOTS[storeSlug] ?? [];
  return pages.flatMap((p) => p.hotspots);
}

/** Convert leaflet hotspots into catalog-shaped products for search/compare. */
export function leafletProductsForStore(
  storeSlug: string,
  supermarket: { id: string; name_en: string; name_ar: string; slug: string; logo_url: string },
) {
  return allLeafletHotspotProducts(storeSlug).map((h) => ({
    id: h.product.id,
    name_en: h.product.name_en,
    name_ar: h.product.name_ar,
    size_value: h.product.size_value,
    size_unit: h.product.size_unit,
    package_description_en: h.product.package_description_en,
    package_description_ar: h.product.package_description_ar,
    variant_en: h.product.brand_en ?? '',
    variant_ar: h.product.brand_ar ?? '',
    image_url: h.product.image_url ?? '/hero-basket.svg',
    price_basis: h.product.size_unit === 'kg' ? 'kg' : 'package',
    brand: {
      id: `leaflet-brand-${h.id}`,
      name_en: h.product.brand_en ?? 'Generic',
      name_ar: h.product.brand_ar ?? 'عام',
    },
    category: {
      id: '33333333-3333-3333-3333-333333333014',
      name_en: 'Weekly offers',
      name_ar: 'عروض الأسبوع',
      slug: 'weekly-offers',
    },
    offers: [
      {
        id: `leaflet-offer-${h.id}`,
        offer_price: h.offer_price,
        regular_price: h.regular_price,
        effective_price: h.offer_price,
        display_price: h.offer_price,
        unit_price: null,
        unit_price_unit: null,
        promotion_type: 'leaflet_offer',
        promotion_description_en: h.promotion_description_en,
        promotion_description_ar: h.promotion_description_ar,
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: false,
        start_date: '2026-08-26',
        end_date: '2026-09-08',
        supermarket,
      },
    ],
  }));
}
