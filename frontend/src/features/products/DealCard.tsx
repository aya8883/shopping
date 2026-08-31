import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { formatSar } from '../../utils/pricing';
import { useAppContext } from '../../contexts/AppContext';
import { SupermarketAvatar } from '../../components/SupermarketMark';
import { supermarketShortName } from '../../utils/supermarketBranding';

export type DealOffer = {
  id: string;
  offer_price: number;
  regular_price?: number | null;
  is_demo?: boolean | null;
  product: {
    id: string;
    name_en: string;
    name_ar: string;
    size_value?: number | null;
    size_unit?: string | null;
    brand?: { name_en: string; name_ar: string } | null;
  };
  supermarket: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    logo_url?: string | null;
  };
};

export function DealCard({ offer }: { offer: DealOffer }) {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const name = locale === 'ar' ? offer.product.name_ar : offer.product.name_en;
  const size =
    offer.product.size_value && offer.product.size_unit
      ? `${offer.product.size_value}${offer.product.size_unit}`
      : null;
  const discount =
    offer.regular_price && Number(offer.regular_price) > Number(offer.offer_price)
      ? Math.round(
          ((Number(offer.regular_price) - Number(offer.offer_price)) /
            Number(offer.regular_price)) *
            100,
        )
      : null;

  return (
    <Box
      component={RouterLink}
      to={`/products/${offer.product.id}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        minWidth: 0,
        textDecoration: 'none',
        color: 'inherit',
        bgcolor: '#fff',
        borderRadius: 3,
        border: '1px solid rgba(26,26,26,0.06)',
        boxShadow: '0 8px 20px rgba(15,23,42,0.05)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 26px rgba(15,23,42,0.09)',
        },
      }}
    >
      {discount ? (
        <Chip
          size="small"
          label={`${discount}%`}
          sx={{
            position: 'absolute',
            top: 10,
            insetInlineStart: 10,
            height: 24,
            bgcolor: 'error.main',
            color: '#fff',
            fontWeight: 800,
            zIndex: 1,
            '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' },
          }}
        />
      ) : null}

      <Box
        sx={{
          width: 84,
          height: 84,
          flexShrink: 0,
          borderRadius: 2.5,
          bgcolor: '#F3F4F6',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Typography fontWeight={900} color="text.secondary" fontSize="0.75rem" textAlign="center" px={0.5}>
          {name.split(' ').slice(0, 2).join(' ')}
        </Typography>
      </Box>

      <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1, pr: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <SupermarketAvatar store={offer.supermarket} size="sm" />
          <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap>
            {supermarketShortName(offer.supermarket, locale)}
          </Typography>
        </Stack>
        <Typography fontWeight={800} fontSize="0.95rem" lineHeight={1.25} noWrap>
          {name}
        </Typography>
        {size ? (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {size}
          </Typography>
        ) : null}
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography fontWeight={900} color="error.main" fontSize="1.15rem">
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
        {offer.is_demo ? (
          <Chip size="small" label={t('app.demoBadge')} sx={{ alignSelf: 'flex-start', height: 22 }} />
        ) : null}
      </Stack>
    </Box>
  );
}
