export type Money = number;

export interface EffectivePriceInput {
  offerPrice: Money;
  promotionType?: string | null;
  minimumQuantity?: Money | null;
}

/**
 * Calculates effective package price for common promotion shapes.
 * MVP: standard discounts return offer price; BOGO halves when qty allows.
 */
export function calculateEffectivePrice(input: EffectivePriceInput): Money {
  const qty = input.minimumQuantity && input.minimumQuantity > 0 ? input.minimumQuantity : 1;
  const price = input.offerPrice;

  switch (input.promotionType) {
    case 'buy_one_get_one':
      return roundMoney((price * qty) / (qty + qty));
    case 'buy_two_get_one':
      return roundMoney((price * 2) / 3);
    case 'multi_buy':
      return roundMoney(price / qty);
    default:
      return roundMoney(price);
  }
}

export function calculateUnitPrice(params: {
  price: Money;
  sizeValue?: Money | null;
  sizeUnit?: string | null;
}): { value: Money; unit: string } | null {
  if (!params.sizeValue || params.sizeValue <= 0 || !params.sizeUnit) {
    return null;
  }
  return {
    value: roundMoney(params.price / params.sizeValue, 4),
    unit: params.sizeUnit,
  };
}

export function roundMoney(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatSar(amount: Money, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface OfferLike {
  id: string;
  offer_price: Money;
  regular_price?: Money | null;
  effective_price?: Money | null;
  promotion_type?: string | null;
  minimum_quantity?: Money | null;
  supermarket?: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
  } | null;
  is_demo?: boolean | null;
}

export interface ComparisonResult {
  offers: Array<OfferLike & { effective: Money }>;
  best?: OfferLike & { effective: Money };
  saving: Money;
}

export function compareProductOffers(offers: OfferLike[]): ComparisonResult {
  const scored = offers
    .map((o) => ({
      ...o,
      effective:
        o.effective_price != null
          ? Number(o.effective_price)
          : calculateEffectivePrice({
              offerPrice: Number(o.offer_price),
              promotionType: o.promotion_type,
              minimumQuantity: o.minimum_quantity != null ? Number(o.minimum_quantity) : 1,
            }),
    }))
    .sort((a, b) => a.effective - b.effective);

  const best = scored[0];
  const second = scored[1];
  const saving = best && second ? roundMoney(second.effective - best.effective) : 0;

  return { offers: scored, best, saving };
}
