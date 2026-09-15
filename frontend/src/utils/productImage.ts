import { assetUrl } from '../utils/assetUrl';

/** Curated art keyed by product id — never category CDN placeholders. */
const BY_PRODUCT_ID: Record<string, string> = {
  'banana-1kg': '/products/banana.svg',
  'tomato-1kg': '/products/tomato.svg',
  '44444444-4444-4444-4444-444444444031': '/products/tomato.svg',
  '44444444-4444-4444-4444-444444444018': '/products/tomato-paste.svg',
  'veal-1kg': '/products/chicken.svg',
  'sadia-chicken-1300g-x3': '/products/chicken.svg',
  '44444444-4444-4444-4444-444444444022': '/products/chicken.svg',
  '44444444-4444-4444-4444-444444444032': '/products/chicken.svg',
  'eggs-30': '/products/eggs.svg',
  '44444444-4444-4444-4444-444444444002': '/products/eggs.svg',
  'nadec-cheese-500g-x2': '/products/labneh.svg',
  '44444444-4444-4444-4444-444444444008': '/products/labneh.svg',
  '44444444-4444-4444-4444-444444444001': '/products/milk.svg',
  '44444444-4444-4444-4444-444444444006': '/products/milk.svg',
  '44444444-4444-4444-4444-444444444007': '/products/milk.svg',
  '44444444-4444-4444-4444-444444444014': '/products/milk.svg',
  'anchor-milk-powder-1.8kg': '/products/milk.svg',
  'basmati-rice-10kg': '/products/rice.svg',
  '44444444-4444-4444-4444-444444444003': '/products/rice.svg',
  '44444444-4444-4444-4444-444444444010': '/products/rice.svg',
  'cornflakes-1kg': '/products/rice.svg',
  '44444444-4444-4444-4444-444444444004': '/products/afia-oil.svg',
  '44444444-4444-4444-4444-444444444035': '/products/noor-oil.svg',
  '44444444-4444-4444-4444-444444444028': '/products/water.svg',
  '44444444-4444-4444-4444-444444444012': '/products/soda.svg',
  '44444444-4444-4444-4444-444444444013': '/products/soda.svg',
  '44444444-4444-4444-4444-444444444027': '/products/soda.svg',
  '44444444-4444-4444-4444-444444444005': '/products/tide.svg',
  '44444444-4444-4444-4444-444444444011': '/products/tide.svg',
  '44444444-4444-4444-4444-444444444034': '/products/signal.svg',
};

function isStorePlaceholder(url?: string | null): boolean {
  return Boolean(url && /\/products\/stores\//i.test(url));
}

/**
 * Resolve a product photo that matches the product identity.
 * Ignores mismatched retailer category JPGs under /products/stores/.
 */
export function resolveProductImage(
  productId?: string | null,
  imageUrl?: string | null,
): string {
  if (productId && BY_PRODUCT_ID[productId]) {
    return assetUrl(BY_PRODUCT_ID[productId]);
  }
  if (imageUrl && !isStorePlaceholder(imageUrl)) {
    return assetUrl(imageUrl);
  }
  return assetUrl('/hero-basket.svg');
}

export function isProductIllustration(url?: string | null): boolean {
  return Boolean(url && /\.svg(\?|$)/i.test(url));
}
