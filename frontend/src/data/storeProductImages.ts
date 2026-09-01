import manifest from './product-images-manifest.json';

const images = manifest.images as Record<string, string>;

/** Local cached product photo for a store listing (from official promo CDN sync). */
export function storeProductImageUrl(
  productId: string,
  storeSlug: string,
  fallback?: string | null,
): string {
  const key = `${storeSlug}/${productId}`;
  return images[key] ?? fallback ?? '/hero-basket.svg';
}

export const productImagesSyncedAt = manifest.syncedAt;
export const productImagesAttribution = manifest.attribution;
