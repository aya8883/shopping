import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import { useTranslation } from 'react-i18next';
import {
  compareProductOffers,
  formatSar,
  type OfferLike,
} from '../../utils/pricing';
import { filterOffersBySelectedStores, useAppContext } from '../../contexts/AppContext';
import { useBasket } from '../../contexts/BasketContext';
import { SupermarketAvatar } from '../../components/SupermarketMark';
import { supermarketShortName } from '../../utils/supermarketBranding';
import type { ProductCardProduct } from './ProductCard';

export function SearchCompareCard({
  product,
  storeFilterId,
}: {
  product: ProductCardProduct;
  storeFilterId?: string | null;
}) {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { addItem, getQuantity } = useBasket();
  const [toast, setToast] = useState(false);

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const brand = locale === 'ar' ? product.brand?.name_ar : product.brand?.name_en;
  const size =
    product.size_value && product.size_unit
      ? `${product.size_value} ${product.size_unit}`
      : null;

  const filtered = useMemo(() => {
    let offers = filterOffersBySelectedStores(
      (product.offers ?? []) as OfferLike[],
      selectedSupermarketIds,
    );
    if (storeFilterId) {
      offers = offers.filter((o) => o.supermarket?.id === storeFilterId);
    }
    return offers;
  }, [product.offers, selectedSupermarketIds, storeFilterId]);

  const comparison = compareProductOffers(filtered);
  const inBasket = getQuantity(product.id);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid rgba(26,26,26,0.08)',
        bgcolor: '#fff',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{ textDecoration: 'none', color: 'inherit', mb: 1.5 }}
      >
        {product.image_url ? (
          <Box
            component="img"
            src={product.image_url}
            alt=""
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              objectFit: 'cover',
              bgcolor: '#F3F4F6',
              flexShrink: 0,
            }}
          />
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight={900} lineHeight={1.25}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {[brand, size].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
      </Stack>

      {comparison.offers.length ? (
        <Stack spacing={0.75} sx={{ mb: 1.5 }}>
          {comparison.offers.map((offer, index) => {
            const isBest = index === 0;
            return (
              <Stack
                key={offer.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: 2,
                  bgcolor: isBest ? 'rgba(22,163,74,0.08)' : 'transparent',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <SupermarketAvatar store={offer.supermarket} size="sm" />
                  <Typography fontWeight={isBest ? 800 : 600} fontSize="0.9rem">
                    {supermarketShortName(offer.supermarket, locale)}
                  </Typography>
                </Stack>
                <Typography
                  fontWeight={900}
                  color={isBest ? 'success.dark' : 'text.primary'}
                  fontSize="0.95rem"
                >
                  {formatSar(offer.effective, locale)}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('product.noCurrentPrice')}
        </Typography>
      )}

      {comparison.best ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip
            size="small"
            color="success"
            label={`${t('product.bestPrice')}: ${supermarketShortName(comparison.best.supermarket, locale)}`}
            sx={{ fontWeight: 800 }}
          />
          {comparison.saving > 0 ? (
            <Chip
              size="small"
              label={`${t('product.youSave')} ${formatSar(comparison.saving, locale)}`}
              sx={{ fontWeight: 800, bgcolor: '#FEF3C7' }}
            />
          ) : null}
        </Stack>
      ) : null}

      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          const best = comparison.best;
          addItem({
            productId: product.id,
            name_en: product.name_en,
            name_ar: product.name_ar,
            size_value: product.size_value ?? undefined,
            size_unit: product.size_unit ?? undefined,
            brand_en: product.brand?.name_en,
            brand_ar: product.brand?.name_ar,
            image_url: product.image_url ?? undefined,
            offer_price: best?.effective,
            supermarket_name_en: best?.supermarket?.name_en,
            supermarket_name_ar: best?.supermarket?.name_ar,
            addedFromSupermarketId: best?.supermarket?.id,
          });
          setToast(true);
        }}
      >
        {inBasket > 0 ? t('product.addToBasketAgain', { count: inBasket }) : t('product.addToBasket')}
      </Button>

      <Snackbar
        open={toast}
        autoHideDuration={1800}
        onClose={() => setToast(false)}
        message={t('product.addedToBasket')}
      />
    </Paper>
  );
}
