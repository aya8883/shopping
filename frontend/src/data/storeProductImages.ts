import manifest from './product-images-manifest.json';
import { assetUrl } from '../utils/assetUrl';

const images = manifest.images as Record<string, string>;

/**
 * Store JPGs that are known product-specific crops (not category banners).
 * Category CDN placeholders often show the wrong item (e.g. fruit pouch for milk).
 */
const TRUSTED_STORE_PRODUCT_IDS = new Set([
  'banana-1kg',
  'tomato-1kg',
  'veal-1kg',
  'sadia-chicken-1300g-x3',
  'eggs-30',
  'nadec-cheese-500g-x2',
  'cornflakes-1kg',
  'basmati-rice-10kg',
  '44444444-4444-4444-4444-444444444022',
  '44444444-4444-4444-4444-444444444032',
]);

/** Local product photo — prefers curated seed art over mismatched category CDN images. */
export function storeProductImageUrl(
  productId: string,
  storeSlug: string,
  fallback?: string | null,
): string {
  const key = `${storeSlug}/${productId}`;
  if (TRUSTED_STORE_PRODUCT_IDS.has(productId) && images[key]) {
    return assetUrl(images[key]);
  }
  return assetUrl(fallback ?? images[key] ?? '/hero-basket.svg');
}

export const productImagesSyncedAt = manifest.syncedAt;
export const productImagesAttribution = manifest.attribution;
