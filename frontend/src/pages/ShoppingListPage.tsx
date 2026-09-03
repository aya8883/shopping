import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import { useBasket } from '../contexts/BasketContext';
import { useAppContext } from '../contexts/AppContext';
import { GET_PRODUCTS_FOR_BASKET } from '../graphql/products/basket';
import {
  compareBasket,
  optimizeBasket,
  type CompareBasketResult,
  type OptimizeBasketResult,
} from '../utils/basket';
import { formatSar } from '../utils/pricing';
import { SupermarketFilter } from '../components/SupermarketFilter';
import { SupermarketAvatar } from '../components/SupermarketMark';
import { supermarketShortName } from '../utils/supermarketBranding';

export function ShoppingListPage() {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { items, setQuantity, removeItem, clearBasket } = useBasket();
  const [compareResult, setCompareResult] = useState<CompareBasketResult | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeBasketResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const ids = useMemo(() => items.map((i) => i.productId), [items]);

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_FOR_BASKET, {
    variables: { ids },
    skip: ids.length === 0,
  });

  const products = data?.products ?? [];

  const runCompare = () => {
    if (!products.length || !items.length) return;
    const result = compareBasket({
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      products,
      storeIds: selectedSupermarketIds.length ? selectedSupermarketIds : undefined,
    });
    setCompareResult(result);
    setOptimizeResult(null);
    setShowDetails(false);
  };

  const runOptimize = () => {
    const result = optimizeBasket({
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      products,
      storeIds: selectedSupermarketIds.length ? selectedSupermarketIds : undefined,
    });
    setOptimizeResult(result);
  };

  // Auto-run comparison when basket or prices change — Smart Basket engine.
  useEffect(() => {
    if (loading || !products.length || !items.length) return;
    runCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute on data identity
  }, [loading, products, items, selectedSupermarketIds]);

  if (items.length === 0) {
    return (
      <Stack spacing={2} className="pb-4">
        <Typography variant="h5" fontWeight={900}>
          {t('list.title')}
        </Typography>
        <Alert severity="info">{t('list.empty')}</Alert>
        <Button component={RouterLink} to="/search" variant="contained" size="large">
          {t('list.startAdding')}
        </Button>
        <Button component={RouterLink} to="/offers" variant="outlined">
          {t('list.browseOffers')}
        </Button>
        <Button component={RouterLink} to="/plan" variant="text">
          {t('plan.title')}
        </Button>
      </Stack>
    );
  }

  const rankedStores =
    compareResult?.stores
      .filter((s) => s.total != null && s.availableCount > 0)
      .sort((a, b) => {
        if (a.complete !== b.complete) return a.complete ? -1 : 1;
        if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount;
        return (a.total ?? 0) - (b.total ?? 0);
      }) ?? [];

  return (
    <Stack spacing={2} className="pb-4">
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={900}>
            {t('list.title')}
          </Typography>
          <Typography color="text.secondary" fontWeight={600}>
            {t('list.itemCount', { count: items.length })}
          </Typography>
        </Box>
        <Button color="inherit" size="small" onClick={clearBasket}>
          {t('list.clear')}
        </Button>
      </Stack>

      <SupermarketFilter dense />

      {loading ? <Skeleton variant="rounded" height={160} /> : null}
      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {t('common.error')}
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Stack divider={<Divider />}>
          {items.map((item) => {
            const name = locale === 'ar' ? item.name_ar : item.name_en;
            const brand = locale === 'ar' ? item.brand_ar : item.brand_en;
            const size =
              item.size_value && item.size_unit
                ? `${item.size_value}${item.size_unit}`
                : null;
            return (
              <Box key={item.productId} sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                  {item.image_url ? (
                    <Box
                      component="img"
                      src={item.image_url}
                      alt=""
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        objectFit: 'cover',
                        bgcolor: '#F3F4F6',
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      component={RouterLink}
                      to={`/products/${item.productId}`}
                      fontWeight={800}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {[brand, size].filter(Boolean).join(' · ')}
                    </Typography>
                    {item.offer_price != null ? (
                      <Typography fontWeight={900} color="error.main" fontSize="0.95rem">
                        {formatSar(Number(item.offer_price), locale)}
                      </Typography>
                    ) : null}
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      size="small"
                      aria-label="decrease"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="increase"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="remove"
                      color="error"
                      onClick={() => removeItem(item.productId)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !products.length}
        onClick={runCompare}
        sx={{ py: 1.5, fontWeight: 900, fontSize: '1.05rem' }}
      >
        {t('list.compare')}
      </Button>

      {compareResult ? (
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={900}>
            {t('list.bestOption')}
          </Typography>

          {compareResult.bestIsPartial ? (
            <Alert severity="info">{t('list.partialBestHint')}</Alert>
          ) : null}

          {rankedStores.length ? (
            <Stack spacing={1.25}>
              {rankedStores.slice(0, 4).map((store, index) => {
                const medals = ['🥇', '🥈', '🥉', '•'];
                const isBest = index === 0;
                return (
                  <Paper
                    key={store.supermarketId}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: isBest ? 'rgba(22,163,74,0.1)' : '#fff',
                      border: isBest
                        ? '1px solid rgba(22,163,74,0.3)'
                        : '1px solid rgba(26,26,26,0.08)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Typography fontSize="1.25rem">{medals[index]}</Typography>
                        <SupermarketAvatar
                          store={{
                            slug: store.slug,
                            name_en: store.name_en,
                            name_ar: store.name_ar,
                          }}
                          size="sm"
                        />
                        <Box>
                          <Typography fontWeight={900}>
                            {supermarketShortName(store, locale)}
                          </Typography>
                          {!store.complete ? (
                            <Typography variant="caption" color="warning.main" fontWeight={700}>
                              {t('list.availability', {
                                available: store.availableCount,
                                total: store.totalCount,
                              })}
                            </Typography>
                          ) : null}
                        </Box>
                      </Stack>
                      <Typography variant="h6" fontWeight={900}>
                        {formatSar(store.total ?? 0, locale)}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Alert severity="warning">{t('list.incompleteCompare')}</Alert>
          )}

          {compareResult.best && compareResult.saving > 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: 3,
                textAlign: 'center',
                bgcolor: '#FEF3C7',
                border: '1px solid rgba(245,196,0,0.45)',
              }}
            >
              <Typography fontWeight={800} color="text.secondary">
                {t('list.youCanSave')}
              </Typography>
              <Typography variant="h4" fontWeight={900} color="warning.dark" sx={{ my: 0.5 }}>
                {formatSar(compareResult.saving, locale)}
              </Typography>
              <Typography fontWeight={700}>
                {t('list.byShoppingAt', {
                  store: supermarketShortName(compareResult.best, locale),
                })}
              </Typography>
              <Button sx={{ mt: 1.5 }} onClick={() => setShowDetails((v) => !v)}>
                {showDetails ? t('list.hideDetails') : t('list.showDetails')}
              </Button>
            </Paper>
          ) : null}

          {showDetails
            ? compareResult.stores.map((store) => (
                <Paper key={store.supermarketId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <div>
                      <Typography fontWeight={800}>
                        {locale === 'ar' ? store.name_ar : store.name_en}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('list.availability', {
                          available: store.availableCount,
                          total: store.totalCount,
                        })}
                      </Typography>
                    </div>
                    <Typography fontWeight={900}>
                      {store.total != null ? formatSar(store.total, locale) : '—'}
                    </Typography>
                  </Stack>
                </Paper>
              ))
            : null}

          <Button
            variant="outlined"
            size="large"
            fullWidth
            disabled={loading || !products.length}
            onClick={runOptimize}
          >
            {t('list.smarterBasket')}
          </Button>
        </Stack>
      ) : null}

      {optimizeResult ? (
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={900}>
            {t('list.smarterBasketTitle')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: 3,
              background:
                'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(245,196,0,0.12))',
              border: '1px solid rgba(15,118,110,0.18)',
            }}
          >
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              {t('list.buyFrom')}
            </Typography>
            {optimizeResult.byStore.map((store) => (
              <Stack
                key={store.supermarketId}
                direction="row"
                justifyContent="space-between"
                sx={{ py: 0.75 }}
              >
                <Typography fontWeight={700}>
                  {supermarketShortName(store, locale)} · {t('list.productsCount', { count: store.lines.length })}
                </Typography>
                <Typography fontWeight={800}>{formatSar(store.subtotal, locale)}</Typography>
              </Stack>
            ))}
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={900}>{t('list.grandTotal')}</Typography>
              <Typography variant="h5" fontWeight={900} color="primary.dark">
                {formatSar(optimizeResult.total, locale)}
              </Typography>
            </Stack>
            {optimizeResult.savingVsBestSingleStore > 0 ? (
              <Chip
                sx={{ mt: 1.5, fontWeight: 800 }}
                color="success"
                label={`${t('list.youSaveVsSingle')}: ${formatSar(optimizeResult.savingVsBestSingleStore, locale)}`}
              />
            ) : null}
          </Paper>

          {optimizeResult.byStore.map((store) => (
            <Paper key={store.supermarketId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography fontWeight={800}>
                  {locale === 'ar' ? store.name_ar : store.name_en}
                </Typography>
                <Typography fontWeight={800}>{formatSar(store.subtotal, locale)}</Typography>
              </Stack>
              <Stack spacing={0.75}>
                {store.lines.map((line) => (
                  <Stack
                    key={line.productId}
                    direction="row"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography variant="body2">
                      {(locale === 'ar' ? line.name_ar : line.name_en) + ` ×${line.quantity}`}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatSar(line.lineTotal, locale)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
