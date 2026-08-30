import {
  calculateEffectivePrice,
  roundMoney,
  type Money,
} from './pricing';

export interface BasketPriceOffer {
  id: string;
  offer_price: Money;
  effective_price?: Money | null;
  promotion_type?: string | null;
  minimum_quantity?: Money | null;
  supermarket: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
  };
}

export interface BasketProductPrices {
  id: string;
  name_en: string;
  name_ar: string;
  offers: BasketPriceOffer[];
}

export interface BasketLineInput {
  productId: string;
  quantity: number;
}

export interface StoreLineResult {
  productId: string;
  name_en: string;
  name_ar: string;
  quantity: number;
  unitEffective: Money;
  lineTotal: Money;
  available: boolean;
}

export interface StoreBasketResult {
  supermarketId: string;
  name_en: string;
  name_ar: string;
  slug: string;
  total: Money | null;
  availableCount: number;
  totalCount: number;
  complete: boolean;
  lines: StoreLineResult[];
}

export interface CompareBasketResult {
  stores: StoreBasketResult[];
  best?: StoreBasketResult;
  saving: Money;
}

export interface OptimizedLine {
  productId: string;
  name_en: string;
  name_ar: string;
  quantity: number;
  unitEffective: Money;
  lineTotal: Money;
  supermarketId: string;
  supermarketNameEn: string;
  supermarketNameAr: string;
  supermarketSlug: string;
}

export interface OptimizeBasketResult {
  total: Money;
  lines: OptimizedLine[];
  byStore: Array<{
    supermarketId: string;
    name_en: string;
    name_ar: string;
    slug: string;
    subtotal: Money;
    lines: OptimizedLine[];
  }>;
  missingProductIds: string[];
  savingVsBestSingleStore: Money;
  bestSingleStoreTotal: Money | null;
}

function effectiveUnit(offer: BasketPriceOffer): Money {
  if (offer.effective_price != null) return Number(offer.effective_price);
  return calculateEffectivePrice({
    offerPrice: Number(offer.offer_price),
    promotionType: offer.promotion_type,
    minimumQuantity: offer.minimum_quantity != null ? Number(offer.minimum_quantity) : 1,
  });
}

function pickBestOffer(
  offers: BasketPriceOffer[],
  allowedStoreIds?: string[],
): BasketPriceOffer | undefined {
  const filtered =
    allowedStoreIds && allowedStoreIds.length > 0
      ? offers.filter((o) => allowedStoreIds.includes(o.supermarket.id))
      : offers;
  if (!filtered.length) return undefined;
  return [...filtered].sort((a, b) => effectiveUnit(a) - effectiveUnit(b))[0];
}

export function compareBasket(params: {
  lines: BasketLineInput[];
  products: BasketProductPrices[];
  storeIds?: string[];
}): CompareBasketResult {
  const byId = new Map(params.products.map((p) => [p.id, p]));
  const storeMap = new Map<
    string,
    { id: string; name_en: string; name_ar: string; slug: string }
  >();

  for (const product of params.products) {
    for (const offer of product.offers) {
      storeMap.set(offer.supermarket.id, offer.supermarket);
    }
  }

  const storeIds =
    params.storeIds && params.storeIds.length > 0
      ? params.storeIds.filter((id) => storeMap.has(id))
      : [...storeMap.keys()];

  const stores: StoreBasketResult[] = storeIds.map((supermarketId) => {
    const meta = storeMap.get(supermarketId)!;
    const lines: StoreLineResult[] = params.lines.map((line) => {
      const product = byId.get(line.productId);
      const offer = product?.offers.find((o) => o.supermarket.id === supermarketId);
      if (!product || !offer) {
        return {
          productId: line.productId,
          name_en: product?.name_en ?? line.productId,
          name_ar: product?.name_ar ?? line.productId,
          quantity: line.quantity,
          unitEffective: 0,
          lineTotal: 0,
          available: false,
        };
      }
      const unit = effectiveUnit(offer);
      return {
        productId: line.productId,
        name_en: product.name_en,
        name_ar: product.name_ar,
        quantity: line.quantity,
        unitEffective: unit,
        lineTotal: roundMoney(unit * line.quantity),
        available: true,
      };
    });

    const available = lines.filter((l) => l.available);
    const complete = available.length === lines.length && lines.length > 0;
    const total =
      available.length === 0
        ? null
        : roundMoney(available.reduce((sum, l) => sum + l.lineTotal, 0));

    return {
      supermarketId,
      name_en: meta.name_en,
      name_ar: meta.name_ar,
      slug: meta.slug,
      total,
      availableCount: available.length,
      totalCount: lines.length,
      complete,
      lines,
    };
  });

  const completeStores = stores
    .filter((s) => s.complete && s.total != null)
    .sort((a, b) => (a.total ?? 0) - (b.total ?? 0));

  const best = completeStores[0];
  const second = completeStores[1];
  const saving =
    best?.total != null && second?.total != null
      ? roundMoney(second.total - best.total)
      : 0;

  return { stores, best, saving };
}

export function optimizeBasket(params: {
  lines: BasketLineInput[];
  products: BasketProductPrices[];
  storeIds?: string[];
}): OptimizeBasketResult {
  const byId = new Map(params.products.map((p) => [p.id, p]));
  const optimizedLines: OptimizedLine[] = [];
  const missingProductIds: string[] = [];

  for (const line of params.lines) {
    const product = byId.get(line.productId);
    const best = product ? pickBestOffer(product.offers, params.storeIds) : undefined;
    if (!product || !best) {
      missingProductIds.push(line.productId);
      continue;
    }
    const unit = effectiveUnit(best);
    optimizedLines.push({
      productId: line.productId,
      name_en: product.name_en,
      name_ar: product.name_ar,
      quantity: line.quantity,
      unitEffective: unit,
      lineTotal: roundMoney(unit * line.quantity),
      supermarketId: best.supermarket.id,
      supermarketNameEn: best.supermarket.name_en,
      supermarketNameAr: best.supermarket.name_ar,
      supermarketSlug: best.supermarket.slug,
    });
  }

  const total = roundMoney(optimizedLines.reduce((sum, l) => sum + l.lineTotal, 0));

  const byStoreMap = new Map<string, OptimizeBasketResult['byStore'][number]>();
  for (const line of optimizedLines) {
    const existing = byStoreMap.get(line.supermarketId);
    if (existing) {
      existing.lines.push(line);
      existing.subtotal = roundMoney(existing.subtotal + line.lineTotal);
    } else {
      byStoreMap.set(line.supermarketId, {
        supermarketId: line.supermarketId,
        name_en: line.supermarketNameEn,
        name_ar: line.supermarketNameAr,
        slug: line.supermarketSlug,
        subtotal: line.lineTotal,
        lines: [line],
      });
    }
  }

  const comparison = compareBasket(params);
  const bestSingle = comparison.best?.total ?? null;
  const savingVsBestSingleStore =
    bestSingle != null && optimizedLines.length === params.lines.length
      ? roundMoney(bestSingle - total)
      : 0;

  return {
    total,
    lines: optimizedLines,
    byStore: [...byStoreMap.values()],
    missingProductIds,
    savingVsBestSingleStore: Math.max(0, savingVsBestSingleStore),
    bestSingleStoreTotal: bestSingle,
  };
}
