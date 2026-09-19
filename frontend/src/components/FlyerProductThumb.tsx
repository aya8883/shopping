import Box from '@mui/material/Box';
import type { LeafletOfferHotspot } from '../data/leafletHotspots';
import { getCanonicalProduct } from '../data/leafletHotspots';
import { assetUrl } from '../utils/assetUrl';
import { resolveProductImage } from '../utils/productImage';

/**
 * Product thumb for a flyer hotspot.
 * Prefers a crop of the printed rectangle; otherwise curated catalog art.
 */
export function FlyerProductThumb({
  hotspot,
  height = 72,
  alt = '',
}: {
  hotspot: LeafletOfferHotspot;
  height?: number;
  alt?: string;
}) {
  const flyerSrc = hotspot.flyer_image_url ? assetUrl(hotspot.flyer_image_url) : '';
  const canCrop =
    Boolean(flyerSrc) &&
    hotspot.width > 0 &&
    hotspot.height > 0 &&
    hotspot.width <= 100 &&
    hotspot.height <= 100;

  if (canCrop && flyerSrc) {
    const scaleX = 100 / hotspot.width;
    const scaleY = 100 / hotspot.height;
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height,
          overflow: 'hidden',
          bgcolor: '#F8FAFC',
          borderRadius: 2,
        }}
      >
        <Box
          component="img"
          src={flyerSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          sx={{
            position: 'absolute',
            width: `${scaleX * 100}%`,
            height: `${scaleY * 100}%`,
            left: `${-hotspot.x * scaleX}%`,
            top: `${-hotspot.y * scaleY}%`,
            maxWidth: 'none',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      </Box>
    );
  }

  const canonical = getCanonicalProduct(hotspot.productId);
  const src = resolveProductImage(hotspot.productId, hotspot.image_url ?? canonical?.image_url);

  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        bgcolor: '#F8FAFC',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }}
      />
    </Box>
  );
}
