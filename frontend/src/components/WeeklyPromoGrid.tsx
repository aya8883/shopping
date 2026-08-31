import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ButtonBase from '@mui/material/ButtonBase';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { useTranslation } from 'react-i18next';
import { formatSar } from '../utils/pricing';
import { useAppContext } from '../contexts/AppContext';

export type PromoOffer = {
  id: string;
  offer_price: number;
  regular_price?: number | null;
  is_demo?: boolean | null;
  promotion_description_en?: string | null;
  promotion_description_ar?: string | null;
  product: {
    id: string;
    name_en: string;
    name_ar: string;
    size_value?: number | null;
    size_unit?: string | null;
    image_url?: string | null;
    package_description_en?: string | null;
    package_description_ar?: string | null;
    brand?: { name_en: string; name_ar: string } | null;
  };
};

export function WeeklyPromoGrid({
  offers,
  accentColor = '#F5C400',
  getQuantity,
  onAdd,
}: {
  offers: PromoOffer[];
  accentColor?: string;
  getQuantity: (productId: string) => number;
  onAdd: (offer: PromoOffer) => void;
}) {
  const { t } = useTranslation();
  const { locale } = useAppContext();

  if (!offers.length) {
    return (
      <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#F3F4F6', textAlign: 'center' }}>
        <Typography color="text.secondary">{t('offers.noOffers')}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
        },
        gap: 1.5,
      }}
    >
      {offers.map((offer) => {
        const name = locale === 'ar' ? offer.product.name_ar : offer.product.name_en;
        const brand =
          locale === 'ar' ? offer.product.brand?.name_ar : offer.product.brand?.name_en;
        const size =
          offer.product.size_value && offer.product.size_unit
            ? `${offer.product.size_value}${offer.product.size_unit}`
            : null;
        const desc =
          locale === 'ar'
            ? offer.promotion_description_ar || offer.product.package_description_ar
            : offer.promotion_description_en || offer.product.package_description_en;
        const discount =
          offer.regular_price && Number(offer.regular_price) > Number(offer.offer_price)
            ? Math.round(
                ((Number(offer.regular_price) - Number(offer.offer_price)) /
                  Number(offer.regular_price)) *
                  100,
              )
            : null;
        const qty = getQuantity(offer.product.id);
        const image = offer.product.image_url || '/hero-basket.svg';

        return (
          <ButtonBase
            key={offer.id}
            onClick={() => onAdd(offer)}
            focusRipple
            aria-label={t('offers.tapToAdd', { name })}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              textAlign: 'start',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#fff',
              border: '1px solid rgba(26,26,26,0.08)',
              boxShadow: '0 8px 22px rgba(15,23,42,0.06)',
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 14px 28px rgba(15,23,42,0.12)',
              },
            }}
          >
            <Box sx={{ position: 'relative', bgcolor: '#F8FAFC' }}>
              <Box
                component="img"
                src={image}
                alt={name}
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                }}
              />
              {discount ? (
                <Chip
                  size="small"
                  label={`${discount}%`}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    insetInlineStart: 8,
                    height: 24,
                    bgcolor: 'error.main',
                    color: '#fff',
                    fontWeight: 800,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              ) : null}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  insetInlineEnd: 8,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: accentColor,
                  color: '#1A1A1A',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
                }}
              >
                <AddShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              {qty > 0 ? (
                <Chip
                  size="small"
                  label={`×${qty}`}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    insetInlineEnd: 8,
                    height: 24,
                    fontWeight: 800,
                  }}
                />
              ) : null}
            </Box>

            <Stack spacing={0.4} sx={{ p: 1.25, minWidth: 0 }}>
              <Typography fontWeight={800} fontSize="0.9rem" lineHeight={1.25} noWrap>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap>
                {[brand, size].filter(Boolean).join(' · ')}
              </Typography>
              {desc ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3,
                    minHeight: '2.6em',
                  }}
                >
                  {desc}
                </Typography>
              ) : null}
              <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ pt: 0.25 }}>
                <Typography fontWeight={900} color="error.main" fontSize="1.1rem">
                  {formatSar(Number(offer.offer_price), locale)}
                </Typography>
                {offer.regular_price ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatSar(Number(offer.regular_price), locale)}
                  </Typography>
                ) : null}
              </Stack>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {t('offers.tapImageHint')}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
