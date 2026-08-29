import { describe, expect, it } from 'vitest';
import {
  calculateEffectivePrice,
  calculateUnitPrice,
  compareProductOffers,
  roundMoney,
} from './pricing';

describe('calculateEffectivePrice', () => {
  it('returns offer price for standard discount', () => {
    expect(calculateEffectivePrice({ offerPrice: 9.95 })).toBe(9.95);
  });

  it('halves price for buy one get one', () => {
    expect(
      calculateEffectivePrice({
        offerPrice: 12,
        promotionType: 'buy_one_get_one',
        minimumQuantity: 1,
      }),
    ).toBe(6);
  });
});

describe('calculateUnitPrice', () => {
  it('computes SAR per liter for milk validation scenario', () => {
    expect(calculateUnitPrice({ price: 9.95, sizeValue: 2, sizeUnit: 'L' })).toEqual({
      value: 4.975,
      unit: 'L',
    });
    expect(calculateUnitPrice({ price: 10.5, sizeValue: 2, sizeUnit: 'L' })).toEqual({
      value: 5.25,
      unit: 'L',
    });
  });
});

describe('compareProductOffers', () => {
  it('picks Carrefour as best for Almarai milk demo', () => {
    const result = compareProductOffers([
      {
        id: '1',
        offer_price: 9.95,
        regular_price: 12.95,
        supermarket: {
          id: 'c',
          name_en: 'Carrefour Saudi Arabia',
          name_ar: 'كارفور',
          slug: 'carrefour',
        },
      },
      {
        id: '2',
        offer_price: 10.5,
        regular_price: 12.5,
        supermarket: {
          id: 'l',
          name_en: 'LuLu Hypermarket',
          name_ar: 'لولو هايبرماركت',
          slug: 'lulu',
        },
      },
    ]);

    expect(result.best?.supermarket?.slug).toBe('carrefour');
    expect(result.best?.effective).toBe(9.95);
    expect(result.saving).toBe(0.55);
  });
});

describe('roundMoney', () => {
  it('rounds to 2 decimals by default', () => {
    expect(roundMoney(1.005)).toBe(1.01);
  });
});
