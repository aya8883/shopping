import { describe, expect, it } from 'vitest';
import { resolveNeed, scoreProductForNeed, suggestBasketPlan } from './basketPlanner';
import type { CatalogProduct } from './basketPlanner';

const catalog: CatalogProduct[] = [
  {
    id: 'afia',
    name_en: 'Afia Sunflower Oil',
    name_ar: 'زيت عافية',
    brand: { name_en: 'Afia', name_ar: 'عافية' },
    category: { slug: 'cooking-oil', name_en: 'Cooking Oil', name_ar: 'زيوت' },
    offers: [
      {
        id: '1',
        offer_price: 25.95,
        supermarket: { id: 'l', name_en: 'LuLu', name_ar: 'لولو', slug: 'lulu' },
      },
      {
        id: '2',
        offer_price: 27.95,
        supermarket: {
          id: 'c',
          name_en: 'Carrefour',
          name_ar: 'كارفور',
          slug: 'carrefour',
        },
      },
    ],
  },
  {
    id: 'noor',
    name_en: 'Noor Sunflower Oil',
    name_ar: 'زيت نور',
    brand: { name_en: 'Noor', name_ar: 'نور' },
    category: { slug: 'cooking-oil', name_en: 'Cooking Oil', name_ar: 'زيوت' },
    offers: [
      {
        id: '3',
        offer_price: 23.5,
        supermarket: { id: 'l', name_en: 'LuLu', name_ar: 'لولو', slug: 'lulu' },
      },
      {
        id: '4',
        offer_price: 24.95,
        supermarket: {
          id: 'c',
          name_en: 'Carrefour',
          name_ar: 'كارفور',
          slug: 'carrefour',
        },
      },
    ],
  },
  {
    id: 'milk',
    name_en: 'Almarai Full Fat Milk',
    name_ar: 'حليب المراعي',
    brand: { name_en: 'Almarai', name_ar: 'المراعي' },
    category: { slug: 'dairy', name_en: 'Dairy', name_ar: 'ألبان' },
    offers: [
      {
        id: '5',
        offer_price: 9.95,
        supermarket: {
          id: 'c',
          name_en: 'Carrefour',
          name_ar: 'كارفور',
          slug: 'carrefour',
        },
      },
      {
        id: '6',
        offer_price: 10.5,
        supermarket: { id: 'l', name_en: 'LuLu', name_ar: 'لولو', slug: 'lulu' },
      },
    ],
  },
];

describe('basket planner brand preference', () => {
  it('prefers Afia when brand is requested even if Noor is cheaper', () => {
    const need = {
      id: '1',
      labelEn: 'Oil',
      labelAr: 'زيت',
      keywords: ['oil', 'زيت'],
      categorySlugs: ['cooking-oil'],
      brandPreference: 'Afia',
      quantity: 1,
    };
    const resolved = resolveNeed(need, catalog);
    expect(resolved.product?.id).toBe('afia');
    expect(scoreProductForNeed(catalog[0], need)).toBeGreaterThan(
      scoreProductForNeed(catalog[1], need),
    );
  });

  it('picks cheapest oil without brand preference', () => {
    const plan = suggestBasketPlan({
      needs: [
        {
          id: 'oil',
          labelEn: 'Oil',
          labelAr: 'زيت',
          keywords: ['oil', 'زيت'],
          categorySlugs: ['cooking-oil'],
          quantity: 1,
        },
        {
          id: 'milk',
          labelEn: 'Milk',
          labelAr: 'حليب',
          keywords: ['milk', 'حليب'],
          categorySlugs: ['dairy'],
          quantity: 1,
        },
      ],
      catalog,
    });
    expect(plan.resolved.find((r) => r.need.id === 'oil')?.product?.id).toBe('noor');
    expect(plan.optimized.total).toBeGreaterThan(0);
    expect(plan.compared.best).toBeTruthy();
  });
});
