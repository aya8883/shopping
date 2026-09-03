import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_PRODUCT_BY_ID } from '../graphql/products/queries';
import { useAppContext, filterOffersBySelectedStores } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { compareProductOffers, formatSar, type OfferLike } from '../utils/pricing';
import { SupermarketFilter } from '../components/SupermarketFilter';
import { SupermarketAvatar } from '../components/SupermarketMark';
import { supermarketShortName } from '../utils/supermarketBranding';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { addItem, getQuantity } = useBasket();
  const [toast, setToast] = useState(false);
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const product = data?.products_by_pk;

  const comparison = useMemo(() => {
    if (!product) return null;
    return compareProductOffers(
      filterOffersBySelectedStores((product.offers ?? []) as OfferLike[], selectedSupermarketIds),
    );
  }, [product, selectedSupermarketIds]);

  if (loading) {
    return <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />;
  }

  if (error || !product) {
    return <Alert severity="error">{t('common.error')}</Alert>;
  }

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const brand = locale === 'ar' ? product.brand?.name_ar : product.brand?.name_en;
  const size =
    product.size_value && product.size_unit
      ? `${product.size_value} ${product.size_unit}`
      : null;
  const inBasket = getQuantity(product.id);
  const best = comparison?.best;

  return (
    <Stack spacing={2.25} className="pb-4">
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {product.image_url ? (
          <Box
            component="img"
            src={product.image_url}
            alt=""
            sx={{
              width: 96,
              height: 96,
              borderRadius: 3,
              objectFit: 'cover',
              bgcolor: '#F3F4F6',
              flexShrink: 0,
            }}
          />
        ) : null}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={900} lineHeight={1.25}>
            {name}
          </Typography>
          <Typography color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
            {[brand, size].filter(Boolean).join(' · ')}
          </Typography>
          {product.offers?.some((o: { is_demo?: boolean }) => o.is_demo) ? (
            <Chip sx={{ mt: 1 }} size="small" label={t('app.demoBadge')} color="warning" />
          ) : null}
        </Box>
      </Stack>

      {best ? (
        <Paper
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(245,196,0,0.12))',
            border: '1px solid rgba(22,163,74,0.2)',
          }}
        >
          <Typography variant="overline" fontWeight={800} color="success.dark">
            {t('product.bestPriceToday')}
          </Typography>
          <Typography variant="h3" fontWeight={900} color="success.dark" sx={{ letterSpacing: '-0.03em' }}>
            {formatSar(best.effective, locale)}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <SupermarketAvatar store={best.supermarket} size="sm" />
            <Typography fontWeight={800}>
              {supermarketShortName(best.supermarket, locale)}
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      <Divider />

      <Typography variant="h6" fontWeight={900}>
        {t('product.comparePrices')}
      </Typography>
      <SupermarketFilter dense />

      {selectedSupermarketIds.length === 0 ? (
        <Alert severity="info">{t('product.selectStoreHint')}</Alert>
      ) : !comparison?.offers.length ? (
        <Typography color="text.secondary">{t('product.noCurrentPrice')}</Typography>
      ) : (
        <Stack spacing={1.25}>
          {comparison.offers.map((offer, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const tone =
              index === 0
                ? { bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)' }
                : index === 1
                  ? { bg: 'rgba(245,196,0,0.12)', border: 'rgba(245,196,0,0.35)' }
                  : { bg: '#fff', border: 'rgba(26,26,26,0.08)' };
            return (
              <Paper
                key={offer.id}
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: tone.bg,
                  border: `1px solid ${tone.border}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Typography fontSize="1.1rem">{medals[index] ?? '•'}</Typography>
                    <SupermarketAvatar store={offer.supermarket} size="sm" />
                    <Box>
                      <Typography fontWeight={800}>
                        {supermarketShortName(offer.supermarket, locale)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('product.updatedToday')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography fontWeight={900} fontSize="1.15rem">
                    {formatSar(offer.effective, locale)}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {comparison && comparison.saving > 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: '#FEF3C7',
            border: '1px solid rgba(245,196,0,0.45)',
            textAlign: 'center',
          }}
        >
          <Typography variant="overline" fontWeight={800}>
            {t('product.saveUpTo')}
          </Typography>
          <Typography variant="h4" fontWeight={900} color="warning.dark">
            {formatSar(comparison.saving, locale)}
          </Typography>
        </Paper>
      ) : null}

      <Button
        variant="contained"
        size="large"
        onClick={() => {
          addItem({
            productId: product.id,
            name_en: product.name_en,
            name_ar: product.name_ar,
            size_value: product.size_value,
            size_unit: product.size_unit,
            brand_en: product.brand?.name_en,
            brand_ar: product.brand?.name_ar,
            image_url: product.image_url,
            offer_price: best?.effective,
            supermarket_name_en: best?.supermarket?.name_en,
            supermarket_name_ar: best?.supermarket?.name_ar,
            addedFromSupermarketId: best?.supermarket?.id,
          });
          setToast(true);
        }}
      >
        {inBasket > 0
          ? t('product.addToBasketAgain', { count: inBasket })
          : t('product.addToBasket')}
      </Button>

      <Snackbar
        open={toast}
        autoHideDuration={2000}
        onClose={() => setToast(false)}
        message={t('product.addedToBasket')}
      />
    </Stack>
  );
}
