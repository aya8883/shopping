import { normalizeProductName } from './normalization';
import {
  compareBasket,
  optimizeBasket,
  type BasketProductPrices,
  type CompareBasketResult,
  type OptimizeBasketResult,
} from './basket';

export interface PlannerNeed {
  id: string;
  /** Display label, e.g. Milk / Oil */
  labelEn: string;
  labelAr: string;
  /** Match keywords in EN/AR */
  keywords: string[];
  categorySlugs?: string[];
  /** Optional preferred brand, e.g. Afia */
  brandPreference?: string | null;
  quantity: number;
}

export interface CatalogProduct extends BasketProductPrices {
  size_value?: number | null;
  size_unit?: string | null;
  brand?: { name_en: string; name_ar: string } | null;
  category?: { name_en?: string; name_ar?: string; slug?: string } | null;
}

export interface ResolvedNeed {
  need: PlannerNeed;
  product: CatalogProduct | null;
  candidates: CatalogProduct[];
  matchScore: number;
}

export interface PlanSuggestion {
  resolved: ResolvedNeed[];
  lines: Array<{ productId: string; quantity: number }>;
  products: BasketProductPrices[];
  optimized: OptimizeBasketResult;
  compared: CompareBasketResult;
  unmatchedLabels: string[];
}

function productSearchBlob(p: CatalogProduct): string {
  return normalizeProductName(
    [
      p.name_en,
      p.name_ar,
      p.brand?.name_en,
      p.brand?.name_ar,
      p.category?.name_en,
      p.category?.name_ar,
      p.category?.slug,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function scoreProductForNeed(product: CatalogProduct, need: PlannerNeed): number {
  const blob = productSearchBlob(product);
  let score = 0;

  for (const keyword of need.keywords) {
    const k = normalizeProductName(keyword);
    if (!k) continue;
    if (blob.includes(k)) score += 20;
  }

  if (need.categorySlugs?.length) {
    const slug = product.category?.slug ?? '';
    if (need.categorySlugs.includes(slug)) score += 25;
  }

  const brandPref = need.brandPreference?.trim();
  if (brandPref) {
    const pref = normalizeProductName(brandPref);
    const brandBlob = normalizeProductName(
      `${product.brand?.name_en ?? ''} ${product.brand?.name_ar ?? ''}`,
    );
    if (brandBlob.includes(pref) || pref.includes(brandBlob)) {
      score += 40;
    } else {
      // Strong penalty so brand preference wins when possible
      score -= 30;
    }
  }

  // Prefer products that have at least one offer
  if (product.offers?.length) score += 5;

  return score;
}

export function resolveNeed(
  need: PlannerNeed,
  catalog: CatalogProduct[],
): ResolvedNeed {
  const scored = catalog
    .map((product) => ({ product, matchScore: scoreProductForNeed(product, need) }))
    .filter((x) => x.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  const brandPref = need.brandPreference?.trim();
  let chosen = scored[0]?.product ?? null;

  if (brandPref) {
    const preferred = scored.find((x) => {
      const pref = normalizeProductName(brandPref);
      const brandBlob = normalizeProductName(
        `${x.product.brand?.name_en ?? ''} ${x.product.brand?.name_ar ?? ''}`,
      );
      return brandBlob.includes(pref) || pref.includes(brandBlob);
    });
    if (preferred) chosen = preferred.product;
  }

  return {
    need,
    product: chosen,
    candidates: scored.slice(0, 5).map((x) => x.product),
    matchScore: scored[0]?.matchScore ?? 0,
  };
}

export function suggestBasketPlan(params: {
  needs: PlannerNeed[];
  catalog: CatalogProduct[];
  storeIds?: string[];
}): PlanSuggestion {
  const resolved = params.needs.map((need) => resolveNeed(need, params.catalog));
  const matched = resolved.filter((r) => r.product);
  const unmatchedLabels = resolved
    .filter((r) => !r.product)
    .map((r) => r.need.labelEn);

  const lines = matched.map((r) => ({
    productId: r.product!.id,
    quantity: r.need.quantity,
  }));

  const products: BasketProductPrices[] = matched.map((r) => ({
    id: r.product!.id,
    name_en: r.product!.name_en,
    name_ar: r.product!.name_ar,
    offers: r.product!.offers,
  }));

  const optimized = optimizeBasket({
    lines,
    products,
    storeIds: params.storeIds,
  });
  const compared = compareBasket({
    lines,
    products,
    storeIds: params.storeIds,
  });

  return {
    resolved,
    lines,
    products,
    optimized,
    compared,
    unmatchedLabels,
  };
}

export const NEED_PRESETS: Omit<PlannerNeed, 'id' | 'quantity' | 'brandPreference'>[] = [
  {
    labelEn: 'Milk',
    labelAr: 'حليب',
    keywords: ['milk', 'حليب', 'almarai', 'مراعي'],
    categorySlugs: ['dairy'],
  },
  {
    labelEn: 'Oil',
    labelAr: 'زيت',
    keywords: ['oil', 'زيت', 'afia', 'عافية', 'sunflower'],
    categorySlugs: ['cooking-oil'],
  },
  {
    labelEn: 'Rice',
    labelAr: 'أرز',
    keywords: ['rice', 'أرز', 'basmati', 'بسمتي'],
    categorySlugs: ['rice-grains'],
  },
  {
    labelEn: 'Toothpaste',
    labelAr: 'معجون أسنان',
    keywords: ['toothpaste', 'tooth', 'معجون', 'اسنان', 'أسنان', 'signal'],
    categorySlugs: ['personal-care'],
  },
  {
    labelEn: 'Eggs',
    labelAr: 'بيض',
    keywords: ['egg', 'eggs', 'بيض'],
    categorySlugs: ['dairy'],
  },
  {
    labelEn: 'Detergent',
    labelAr: 'منظف',
    keywords: ['tide', 'detergent', 'تايد', 'غسيل'],
    categorySlugs: ['cleaning'],
  },
];
