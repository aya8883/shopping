import { assetUrl } from '../utils/assetUrl';

/**
 * Prefer curated product art. Store CDN “category” JPGs often show the wrong item
 * (berries for banana, fish for tomato, etc.), so we do not use them as product photos.
 */
export function storeProductImageUrl(
  _productId: string,
  _storeSlug: string,
  fallback?: string | null,
): string {
  return assetUrl(fallback ?? '/hero-basket.svg');
}

export const productImagesSyncedAt = null;
export const productImagesAttribution =
  'Product illustrations are curated placeholders until retailer product photos are matched per SKU.';
