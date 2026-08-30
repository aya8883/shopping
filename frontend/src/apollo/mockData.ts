/** Local demo data used when Hasura is unavailable (no Docker). */

export const mockCategories = [
  { id: '33333333-3333-3333-3333-333333333001', name_en: 'Dairy', name_ar: 'ألبان', slug: 'dairy', icon: 'dairy' },
  { id: '33333333-3333-3333-3333-333333333002', name_en: 'Meat & Poultry', name_ar: 'لحوم ودواجن', slug: 'meat-poultry', icon: 'meat' },
  { id: '33333333-3333-3333-3333-333333333003', name_en: 'Rice & Grains', name_ar: 'أرز وحبوب', slug: 'rice-grains', icon: 'grains' },
  { id: '33333333-3333-3333-3333-333333333004', name_en: 'Cooking Oil', name_ar: 'زيوت الطبخ', slug: 'cooking-oil', icon: 'oil' },
  { id: '33333333-3333-3333-3333-333333333005', name_en: 'Beverages', name_ar: 'مشروبات', slug: 'beverages', icon: 'drink' },
  { id: '33333333-3333-3333-3333-333333333007', name_en: 'Cleaning', name_ar: 'مواد تنظيف', slug: 'cleaning', icon: 'clean' },
];

export const mockSupermarkets = [
  {
    id: '11111111-1111-1111-1111-111111111001',
    name_en: 'Carrefour Saudi Arabia',
    name_ar: 'كارفور',
    slug: 'carrefour',
    logo_url: null,
  },
  {
    id: '11111111-1111-1111-1111-111111111002',
    name_en: 'LuLu Hypermarket',
    name_ar: 'لولو هايبرماركت',
    slug: 'lulu',
    logo_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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

export function getMockCurrentLeaflets() {
  const { start, end } = thisWeekRange();

  return mockSupermarkets.map((store, index) => {
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
              brand: p.brand,
            },
          })),
      )
      .sort((a, b) => a.offer_price - b.offer_price);

    return {
      id: `66666666-6666-6666-6666-66666666600${index + 1}`,
      title_en: 'Weekly Offers',
      title_ar: 'عروض الأسبوع',
      start_date: start,
      end_date: end,
      city: 'Riyadh',
      status: 'published',
      supermarket: store,
      offers: storeOffers,
    };
  });
}
