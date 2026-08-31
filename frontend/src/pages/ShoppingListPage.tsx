import { useMemo, useState } from 'react';
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

export function ShoppingListPage() {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { items, setQuantity, removeItem, clearBasket } = useBasket();
  const [compareResult, setCompareResult] = useState<CompareBasketResult | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeBasketResult | null>(null);

  const ids = useMemo(() => items.map((i) => i.productId), [items]);

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_FOR_BASKET, {
    variables: { ids },
    skip: ids.length === 0,
  });

  const products = data?.products ?? [];

  const runCompare = () => {
    const result = compareBasket({
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      products,
      storeIds: selectedSupermarketIds,
    });
    setCompareResult(result);
    setOptimizeResult(null);
  };

  const runOptimize = () => {
    const result = optimizeBasket({
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      products,
      storeIds: selectedSupermarketIds,
    });
    setOptimizeResult(result);
    setCompareResult(null);
  };

  if (items.length === 0) {
    return (
      <Stack spacing={2} className="pb-4">
        <Typography variant="h5" fontWeight={700}>
          {t('list.title')}
        </Typography>
        <Alert severity="info">{t('list.empty')}</Alert>
        <Button component={RouterLink} to="/plan" variant="contained" size="large">
          {t('plan.title')}
        </Button>
        <Button component={RouterLink} to="/offers" variant="outlined">
          {t('list.browseOffers')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} className="pb-4">
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          {t('list.title')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/plan" size="small">
            {t('plan.short')}
          </Button>
          <Button color="inherit" size="small" onClick={clearBasket}>
            {t('list.clear')}
          </Button>
        </Stack>
      </Stack>

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

      <Paper variant="outlined">
        <Stack divider={<Divider />}>
          {items.map((item) => {
            const name = locale === 'ar' ? item.name_ar : item.name_en;
            const brand = locale === 'ar' ? item.brand_ar : item.brand_en;
            const size =
              item.size_value && item.size_unit
                ? `${item.size_value}${item.size_unit}`
                : null;
            const desc = locale === 'ar' ? item.description_ar : item.description_en;
            const storeName =
              locale === 'ar' ? item.supermarket_name_ar : item.supermarket_name_en;
            return (
              <Box key={item.productId} sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                  {item.image_url ? (
                    <Box
                      component="img"
                      src={item.image_url}
                      alt=""
                      sx={{
                        width: 56,
                        height: 56,
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
                      {[brand, size, storeName].filter(Boolean).join(' · ')}
                    </Typography>
                    {desc ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {desc}
                      </Typography>
                    ) : null}
                    {item.offer_price != null ? (
                      <Typography
                        fontWeight={900}
                        color="error.main"
                        fontSize="0.95rem"
                        sx={{ mt: 0.25 }}
                      >
                        {formatSar(Number(item.offer_price), locale)}
                        {item.regular_price != null ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1, textDecoration: 'line-through' }}
                          >
                            {formatSar(Number(item.regular_price), locale)}
                          </Typography>
                        ) : null}
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || !products.length}
          onClick={runCompare}
        >
          {t('list.compare')}
        </Button>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          disabled={loading || !products.length}
          onClick={runOptimize}
        >
          {t('list.optimize')}
        </Button>
      </Stack>

      {compareResult ? (
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            {t('list.compareResult')}
          </Typography>
          {compareResult.best ? (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background:
                  'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(21,128,61,0.10))',
                border: '1px solid rgba(15,118,110,0.18)',
              }}
            >
              <Typography variant="overline">{t('list.winner')}</Typography>
              <Typography variant="h5" fontWeight={700}>
                {locale === 'ar' ? compareResult.best.name_ar : compareResult.best.name_en}
              </Typography>
              <Typography variant="h4" color="primary.dark" fontWeight={700}>
                {formatSar(compareResult.best.total ?? 0, locale)}
              </Typography>
              {compareResult.saving > 0 ? (
                <Chip
                  sx={{ mt: 1 }}
                  color="success"
                  label={`${t('list.youSave')}: ${formatSar(compareResult.saving, locale)}`}
                />
              ) : null}
            </Paper>
          ) : (
            <Alert severity="warning">{t('list.incompleteCompare')}</Alert>
          )}

          {compareResult.stores.map((store) => (
            <Paper key={store.supermarketId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <div>
                  <Typography fontWeight={700}>
                    {locale === 'ar' ? store.name_ar : store.name_en}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('list.availability', {
                      available: store.availableCount,
                      total: store.totalCount,
                    })}
                  </Typography>
                  {!store.complete ? (
                    <Chip size="small" color="warning" sx={{ mt: 0.5 }} label={t('list.incomplete')} />
                  ) : null}
                </div>
                <Typography variant="h6" fontWeight={700}>
                  {store.total != null ? formatSar(store.total, locale) : '—'}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}

      {optimizeResult ? (
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            {t('list.optimizeResult')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background:
                'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(194,65,12,0.08))',
              border: '1px solid rgba(15,118,110,0.18)',
            }}
          >
            <Typography variant="overline">{t('list.mixedBasket')}</Typography>
            <Typography variant="h4" color="primary.dark" fontWeight={700}>
              {formatSar(optimizeResult.total, locale)}
            </Typography>
            {optimizeResult.savingVsBestSingleStore > 0 ? (
              <Chip
                sx={{ mt: 1 }}
                color="success"
                label={`${t('list.youSaveVsSingle')}: ${formatSar(optimizeResult.savingVsBestSingleStore, locale)}`}
              />
            ) : null}
            {optimizeResult.missingProductIds.length ? (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                {t('list.missingInOptimize', {
                  count: optimizeResult.missingProductIds.length,
                })}
              </Alert>
            ) : null}
          </Paper>

          {optimizeResult.byStore.map((store) => (
            <Paper key={store.supermarketId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography fontWeight={700}>
                  {locale === 'ar' ? store.name_ar : store.name_en}
                </Typography>
                <Typography fontWeight={700}>{formatSar(store.subtotal, locale)}</Typography>
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
                    <Typography variant="body2" fontWeight={600}>
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
