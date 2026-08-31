export type CatalogProduct = {
  id: string;
  name_en: string;
  name_ar: string;
  size_value?: number | null;
  size_unit?: string | null;
  brand?: { name_en: string; name_ar: string } | null;
};

export type OfferBlock = {
  rawText: string;
  productName?: string;
  brand?: string;
  size?: string;
  unit?: string;
  regularPrice?: number;
  offerPrice?: number;
  promotion?: string;
};

export type MatchedOffer = {
  offerBlock: OfferBlock;
  product: CatalogProduct | null;
  matchScore: number;
  offer_price: number;
  regular_price?: number | null;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreProductMatch(product: CatalogProduct, block: OfferBlock): number {
  const blob = normalize(
    [product.name_en, product.name_ar, product.brand?.name_en, product.brand?.name_ar]
      .filter(Boolean)
      .join(' '),
  );
  let score = 0;
  const name = normalize(block.productName ?? '');
  const brand = normalize(block.brand ?? '');
  if (name && blob.includes(name)) score += 40;
  else if (name) {
    for (const part of name.split(' ').filter((p) => p.length > 2)) {
      if (blob.includes(part)) score += 12;
    }
  }
  if (brand && blob.includes(brand)) score += 25;
  if (block.size && String(product.size_value ?? '') === String(block.size)) score += 10;
  if (block.unit && normalize(product.size_unit ?? '') === normalize(block.unit)) score += 8;
  return score;
}

export function matchOfferBlocks(
  blocks: OfferBlock[],
  catalog: CatalogProduct[],
): MatchedOffer[] {
  return blocks.map((block) => {
    const ranked = catalog
      .map((product) => ({ product, matchScore: scoreProductMatch(product, block) }))
      .filter((x) => x.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore);
    const best = ranked[0];
    return {
      offerBlock: block,
      product: best?.product ?? null,
      matchScore: best?.matchScore ?? 0,
      offer_price: block.offerPrice ?? 0,
      regular_price: block.regularPrice ?? null,
    };
  });
}
