import { describe, expect, it } from 'vitest';
import { compareBasket, optimizeBasket } from './basket';

const products = [
  {
    id: 'milk',
    name_en: 'Milk',
    name_ar: 'حليب',
    offers: [
      {
        id: 'm1',
        offer_price: 9.95,
        supermarket: {
          id: 'c',
          name_en: 'Carrefour',
          name_ar: 'كارفور',
          slug: 'carrefour',
        },
      },
      {
        id: 'm2',
        offer_price: 10.5,
        supermarket: { id: 'l', name_en: 'LuLu', name_ar: 'لولو', slug: 'lulu' },
      },
    ],
  },
  {
    id: 'eggs',
    name_en: 'Eggs',
    name_ar: 'بيض',
    offers: [
      {
        id: 'e1',
        offer_price: 17.95,
        supermarket: {
          id: 'c',
          name_en: 'Carrefour',
          name_ar: 'كارفور',
          slug: 'carrefour',
        },
      },
      {
        id: 'e2',
        offer_price: 15.95,
        supermarket: { id: 'l', name_en: 'LuLu', name_ar: 'لولو', slug: 'lulu' },
      },
    ],
  },
];

describe('compareBasket', () => {
  it('picks cheapest complete single store', () => {
    const result = compareBasket({
      lines: [
        { productId: 'milk', quantity: 2 },
        { productId: 'eggs', quantity: 1 },
      ],
      products,
    });
    // Carrefour: 9.95*2 + 17.95 = 37.85
    // LuLu: 10.5*2 + 15.95 = 36.95
    expect(result.best?.slug).toBe('lulu');
    expect(result.best?.total).toBe(36.95);
    expect(result.saving).toBe(0.9);
  });
});

describe('optimizeBasket', () => {
  it('splits across stores for better total', () => {
    const result = optimizeBasket({
      lines: [
        { productId: 'milk', quantity: 2 },
        { productId: 'eggs', quantity: 1 },
      ],
      products,
    });
    // Milk from Carrefour 19.90 + Eggs from LuLu 15.95 = 35.85
    expect(result.total).toBe(35.85);
    expect(result.byStore).toHaveLength(2);
    expect(result.savingVsBestSingleStore).toBe(1.1);
  });
});
