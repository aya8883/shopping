/** Local demo data used when Hasura is unavailable (no Docker). */

export const mockCategories = [
  { id: '33333333-3333-3333-3333-333333333001', name_en: 'Dairy', name_ar: 'ألبان', slug: 'dairy', icon: 'dairy' },
  { id: '33333333-3333-3333-3333-333333333002', name_en: 'Meat & Poultry', name_ar: 'لحوم ودواجن', slug: 'meat-poultry', icon: 'meat' },
  { id: '33333333-3333-3333-3333-333333333003', name_en: 'Rice & Grains', name_ar: 'أرز وحبوب', slug: 'rice-grains', icon: 'grains' },
  { id: '33333333-3333-3333-3333-333333333004', name_en: 'Cooking Oil', name_ar: 'زيوت الطبخ', slug: 'cooking-oil', icon: 'oil' },
  { id: '33333333-3333-3333-3333-333333333005', name_en: 'Beverages', name_ar: 'مشروبات', slug: 'beverages', icon: 'drink' },
  { id: '33333333-3333-3333-3333-333333333007', name_en: 'Cleaning', name_ar: 'مواد تنظيف', slug: 'cleaning', icon: 'clean' },
  { id: '33333333-3333-3333-3333-333333333008', name_en: 'Personal Care', name_ar: 'العناية الشخصية', slug: 'personal-care', icon: 'care' },
];

export const mockSupermarkets = [
  {
    id: '11111111-1111-1111-1111-111111111001',
    name_en: 'Carrefour Saudi Arabia',
    name_ar: 'كارفور',
    slug: 'carrefour',
    logo_url: '/supermarkets/carrefour.svg',
  },
  {
    id: '11111111-1111-1111-1111-111111111002',
    name_en: 'LuLu Hypermarket',
    name_ar: 'لولو هايبرماركت',
    slug: 'lulu',
    logo_url: '/supermarkets/lulu.svg',
  },
];

const carrefour = mockSupermarkets[0];
const lulu = mockSupermarkets[1];

export const mockProducts = [
  {
    id: '44444444-4444-4444-4444-444444444001',
    name_en: 'Almarai Full Fat Milk',
    name_ar: 'حليب المراعي كامل الدسم',
    size_value: 2,
    size_unit: 'L',
    package_description_en: '2L bottle',
    package_description_ar: 'زجاجة 2 لتر',
    variant_en: 'Full Fat',
    variant_ar: 'كامل الدسم',
    image_url: '/products/milk.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222001', name_en: 'Almarai', name_ar: 'المراعي' },
    category: { id: '33333333-3333-3333-3333-333333333001', name_en: 'Dairy', name_ar: 'ألبان', slug: 'dairy' },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555001',
        offer_price: 9.95,
        regular_price: 12.95,
        effective_price: 9.95,
        display_price: 9.95,
        unit_price: 4.975,
        unit_price_unit: 'L',
        promotion_type: 'standard_discount',
        promotion_description_en: 'Weekly offer',
        promotion_description_ar: 'عرض الأسبوع',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555002',
        offer_price: 10.5,
        regular_price: 12.5,
        effective_price: 10.5,
        display_price: 10.5,
        unit_price: 5.25,
        unit_price_unit: 'L',
        promotion_type: 'standard_discount',
        promotion_description_en: 'Weekly offer',
        promotion_description_ar: 'عرض الأسبوع',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444002',
    name_en: 'Fresh Eggs 30 Pack',
    name_ar: 'بيض طازج عبوة 30',
    size_value: 30,
    size_unit: 'piece',
    package_description_en: '30 eggs',
    package_description_ar: '30 بيضة',
    variant_en: 'Large',
    variant_ar: 'كبير',
    image_url: '/products/eggs.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222010', name_en: 'Generic', name_ar: 'عام' },
    category: { id: '33333333-3333-3333-3333-333333333001', name_en: 'Dairy', name_ar: 'ألبان', slug: 'dairy' },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555003',
        offer_price: 17.95,
        regular_price: 19.95,
        effective_price: 17.95,
        display_price: 17.95,
        unit_price: null,
        unit_price_unit: null,
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555004',
        offer_price: 15.95,
        regular_price: 18.95,
        effective_price: 15.95,
        display_price: 15.95,
        unit_price: null,
        unit_price_unit: null,
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444003',
    name_en: 'Basmati Rice',
    name_ar: 'أرز بسمتي',
    size_value: 10,
    size_unit: 'kg',
    package_description_en: '10kg bag',
    package_description_ar: 'كيس 10 كجم',
    variant_en: 'Premium',
    variant_ar: 'فاخر',
    image_url: '/products/rice.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222004', name_en: 'Al Shalan', name_ar: 'الشعلان' },
    category: {
      id: '33333333-3333-3333-3333-333333333003',
      name_en: 'Rice & Grains',
      name_ar: 'أرز وحبوب',
      slug: 'rice-grains',
    },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555005',
        offer_price: 69.95,
        regular_price: 79.95,
        effective_price: 69.95,
        display_price: 69.95,
        unit_price: 6.995,
        unit_price_unit: 'kg',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555006',
        offer_price: 74.95,
        regular_price: 82.0,
        effective_price: 74.95,
        display_price: 74.95,
        unit_price: 7.495,
        unit_price_unit: 'kg',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444004',
    name_en: 'Afia Sunflower Oil',
    name_ar: 'زيت عافية دوار الشمس',
    size_value: 1.5,
    size_unit: 'L',
    package_description_en: '1.5L bottle',
    package_description_ar: 'زجاجة 1.5 لتر',
    variant_en: 'Sunflower',
    variant_ar: 'دوار الشمس',
    image_url: '/products/afia-oil.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222003', name_en: 'Afia', name_ar: 'عافية' },
    category: {
      id: '33333333-3333-3333-3333-333333333004',
      name_en: 'Cooking Oil',
      name_ar: 'زيوت الطبخ',
      slug: 'cooking-oil',
    },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555007',
        offer_price: 27.95,
        regular_price: 29.95,
        effective_price: 27.95,
        display_price: 27.95,
        unit_price: 18.6333,
        unit_price_unit: 'L',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555008',
        offer_price: 25.95,
        regular_price: 28.95,
        effective_price: 25.95,
        display_price: 25.95,
        unit_price: 17.3,
        unit_price_unit: 'L',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444005',
    name_en: 'Tide Automatic Detergent',
    name_ar: 'تايد أوتوماتيك',
    size_value: 5,
    size_unit: 'kg',
    package_description_en: '5kg pack',
    package_description_ar: 'عبوة 5 كجم',
    variant_en: 'Automatic',
    variant_ar: 'أوتوماتيك',
    image_url: '/products/tide.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222006', name_en: 'Tide', name_ar: 'تايد' },
    category: {
      id: '33333333-3333-3333-3333-333333333007',
      name_en: 'Cleaning',
      name_ar: 'مواد تنظيف',
      slug: 'cleaning',
    },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555009',
        offer_price: 39.95,
        regular_price: 49.95,
        effective_price: 39.95,
        display_price: 39.95,
        unit_price: 7.99,
        unit_price_unit: 'kg',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555010',
        offer_price: 44.95,
        regular_price: 52.0,
        effective_price: 44.95,
        display_price: 44.95,
        unit_price: 8.99,
        unit_price_unit: 'kg',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444006',
    name_en: 'Noor Sunflower Oil',
    name_ar: 'زيت نور دوار الشمس',
    size_value: 1.5,
    size_unit: 'L',
    package_description_en: '1.5L bottle',
    package_description_ar: 'زجاجة 1.5 لتر',
    variant_en: 'Sunflower',
    variant_ar: 'دوار الشمس',
    image_url: '/products/noor-oil.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222010', name_en: 'Noor', name_ar: 'نور' },
    category: {
      id: '33333333-3333-3333-3333-333333333004',
      name_en: 'Cooking Oil',
      name_ar: 'زيوت الطبخ',
      slug: 'cooking-oil',
    },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555011',
        offer_price: 24.95,
        regular_price: 27.95,
        effective_price: 24.95,
        display_price: 24.95,
        unit_price: 16.6333,
        unit_price_unit: 'L',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555012',
        offer_price: 23.5,
        regular_price: 26.95,
        effective_price: 23.5,
        display_price: 23.5,
        unit_price: 15.6667,
        unit_price_unit: 'L',
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444007',
    name_en: 'Signal Toothpaste',
    name_ar: 'معجون أسنان سيجنال',
    size_value: 100,
    size_unit: 'g',
    package_description_en: '100g tube',
    package_description_ar: 'أنبوب 100 جرام',
    variant_en: 'Cavity Fighter',
    variant_ar: 'حماية التسوس',
    image_url: '/products/signal.svg',
    price_basis: 'package',
    brand: { id: '22222222-2222-2222-2222-222222222011', name_en: 'Signal', name_ar: 'سيجنال' },
    category: {
      id: '33333333-3333-3333-3333-333333333008',
      name_en: 'Personal Care',
      name_ar: 'العناية الشخصية',
      slug: 'personal-care',
    },
    offers: [
      {
        id: '55555555-5555-5555-5555-555555555013',
        offer_price: 8.95,
        regular_price: 10.95,
        effective_price: 8.95,
        display_price: 8.95,
        unit_price: null,
        unit_price_unit: null,
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: carrefour,
      },
      {
        id: '55555555-5555-5555-5555-555555555014',
        offer_price: 7.95,
        regular_price: 9.95,
        effective_price: 7.95,
        display_price: 7.95,
        unit_price: null,
        unit_price_unit: null,
        promotion_type: 'standard_discount',
        minimum_quantity: 1,
        currency: 'SAR',
        city: 'Riyadh',
        is_demo: true,
        start_date: '2026-08-01',
        end_date: '2026-12-31',
        supermarket: lulu,
      },
    ],
  },
];

export function searchMockProducts(pattern: string, limit = 20) {
  const needle = pattern.replace(/%/g, '').trim().toLowerCase();
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
  // Week starting Saturday (common in Saudi Arabia)
  const day = today.getDay(); // 0 Sun … 6 Sat
  const daysSinceSaturday = (day + 1) % 7;
  start.setDate(today.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: isoDate(start), end: isoDate(end), today: isoDate(today) };
}

const LEAFLET_SOURCE: Record<string, string> = {
  carrefour: 'https://www.carrefourksa.com/mafsau/en/c/Offers',
  lulu: 'https://www.luluhypermarket.com/en-sa/promotions',
};

function mockLeafletPages(slug: string, leafletId: string) {
  return [1, 2, 3].map((page_number) => ({
    id: `${leafletId}-page-${page_number}`,
    page_number,
    image_url: `/leaflets/${slug}/page-${page_number}.svg`,
    processing_status: 'ready',
  }));
}

export function getMockCurrentLeaflets() {
  const { start, end } = thisWeekRange();

  const seeded = mockSupermarkets.map((store, index) => {
    const leafletId = `66666666-6666-6666-6666-66666666600${index + 1}`;
    const shortEn = store.slug === 'lulu' ? 'LuLu' : 'Carrefour';
    const shortAr = store.slug === 'lulu' ? 'لولو' : 'كارفور';

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
            promotion_description_en:
              'promotion_description_en' in o && o.promotion_description_en
                ? o.promotion_description_en
                : 'Weekly offer',
            promotion_description_ar:
              'promotion_description_ar' in o && o.promotion_description_ar
                ? o.promotion_description_ar
                : 'عرض الأسبوع',
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

    return {
      id: leafletId,
      title_en: `${shortEn} weekly leaflet`,
      title_ar: `نشرة ${shortAr} الأسبوعية`,
      start_date: start,
      end_date: end,
      city: 'Riyadh',
      status: 'published',
      source_url: LEAFLET_SOURCE[store.slug] ?? null,
      original_file_url: `/leaflets/${store.slug}/page-1.svg`,
      supermarket: store,
      pages: mockLeafletPages(store.slug, leafletId),
      offers: storeOffers,
    };
  });

  // Overlay leaflets published via Admin ingest (localStorage)
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
