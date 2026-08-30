import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import {
  GET_CATEGORIES,
  GET_SUPERMARKETS,
  SEARCH_PRODUCTS,
} from '../graphql/products/queries';
import { GET_PRODUCTS_BY_CATEGORY } from '../graphql/products/category';
import {
  filterOffersBySelectedStores,
  useAppContext,
} from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { type ProductCardProduct } from '../features/products/ProductCard';
import { PriceComparisonPanel } from '../features/products/PriceComparisonPanel';
import { compareProductOffers, formatSar } from '../utils/pricing';

type Store = { id: string; name_en: string; name_ar: string; slug: string };
type Category = { id: string; name_en: string; name_ar: string; slug: string };
type Mode = 'category' | 'product';

export function ComparePage() {
  const { t } = useTranslation();
  const {
    locale,
    selectedSupermarketIds,
    setSelectedSupermarketIds,
    maxStoreCount,
    setMaxStoreCount,
  } = useAppContext();
  const { addItem, getQuantity } = useBasket();

  const [mode, setMode] = useState<Mode>('category');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { data: storesData, loading: storesLoading } = useQuery(GET_SUPERMARKETS);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const stores: Store[] = storesData?.supermarkets ?? [];
  const categories: Category[] = categoriesData?.product_categories ?? [];

  const { data: categoryProductsData, loading: categoryProductsLoading } = useQuery(
    GET_PRODUCTS_BY_CATEGORY,
    {
      variables: { categoryId, limit: 40 },
      skip: !categoryId || mode !== 'category',
    },
  );

  const searchPattern = useMemo(() => {
    const q = productQuery.trim();
    return q ? `%${q}%` : '';
  }, [productQuery]);

  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: searchPattern, limit: 20 },
    skip: mode !== 'product' || !searchPattern,
  });

  useEffect(() => {
    if (!stores.length) return;
    if (localStorage.getItem('wain-awfar.selected-supermarket-ids') === null) {
      const n = maxStoreCount ?? Math.min(2, stores.length);
      setSelectedSupermarketIds(stores.slice(0, n).map((s) => s.id));
    }
  }, [stores, maxStoreCount, setSelectedSupermarketIds]);

  const toggleStore = (id: string) => {
    const selected = selectedSupermarketIds.includes(id);
    if (selected) {
      setSelectedSupermarketIds(selectedSupermarketIds.filter((x) => x !== id));
      return;
    }
    if (maxStoreCount && selectedSupermarketIds.length >= maxStoreCount) {
      setSelectedSupermarketIds([...selectedSupermarketIds.slice(1), id]);
      return;
    }
    setSelectedSupermarketIds([...selectedSupermarketIds, id]);
  };

  const categoryProducts: ProductCardProduct[] = categoryProductsData?.products ?? [];
  const searchProducts: ProductCardProduct[] = searchData?.products ?? [];
  const selectedProduct =
    searchProducts.find((p) => p.id === selectedProductId) ??
    categoryProducts.find((p) => p.id === selectedProductId) ??
    null;

  const rankedCategoryProducts = useMemo(() => {
    return [...categoryProducts]
      .map((p) => {
        const filtered = filterOffersBySelectedStores(p.offers ?? [], selectedSupermarketIds);
        const comparison = compareProductOffers(filtered);
        return { product: p, comparison };
      })
      .filter((x) => x.comparison.offers.length > 0)
      .sort(
        (a, b) => (a.comparison.best?.effective ?? 0) - (b.comparison.best?.effective ?? 0),
      );
  }, [categoryProducts, selectedSupermarketIds]);

  return (
    <Stack spacing={2.5} className="pb-4">
      <div>
        <Typography variant="h5" fontWeight={700}>
          {t('compare.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('compare.subtitle')}
        </Typography>
      </div>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          1. {t('compare.stepStores')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('compare.maxStoresHint')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          color="primary"
          size="small"
          value={maxStoreCount ?? 0}
          onChange={(_e, value: number | null) => {
            if (value == null) return;
            setMaxStoreCount(value === 0 ? null : value);
          }}
          sx={{ mb: 1.5, flexWrap: 'wrap' }}
        >
          <ToggleButton value={1}>{t('compare.storesCount', { count: 1 })}</ToggleButton>
          <ToggleButton value={2}>{t('compare.storesCount', { count: 2 })}</ToggleButton>
          <ToggleButton value={3}>{t('compare.storesCount', { count: 3 })}</ToggleButton>
          <ToggleButton value={0}>{t('compare.storesAll')}</ToggleButton>
        </ToggleButtonGroup>

        {storesLoading ? (
          <Skeleton variant="rounded" height={40} />
        ) : (
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {stores.map((store) => {
              const selected = selectedSupermarketIds.includes(store.id);
              const order = selected ? selectedSupermarketIds.indexOf(store.id) + 1 : null;
              const label = locale === 'ar' ? store.name_ar : store.name_en;
              return (
                <Chip
                  key={store.id}
                  clickable
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  label={order ? `${order}. ${label}` : label}
                  onClick={() => toggleStore(store.id)}
                  sx={{ fontWeight: selected ? 700 : 500 }}
                />
              );
            })}
          </Stack>
        )}
        {selectedSupermarketIds.length === 0 ? (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            {t('product.selectStoreHint')}
          </Alert>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {t('compare.selectedCount', { count: selectedSupermarketIds.length })}
            {maxStoreCount ? ` · ${t('compare.maxLabel', { count: maxStoreCount })}` : ''}
          </Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          2. {t('compare.stepWhat')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          color="primary"
          size="small"
          fullWidth
          value={mode}
          onChange={(_e, value: Mode | null) => {
            if (!value) return;
            setMode(value);
            setSelectedProductId(null);
          }}
          sx={{ mb: 1.5 }}
        >
          <ToggleButton value="category">{t('compare.byCategory')}</ToggleButton>
          <ToggleButton value="product">{t('compare.byProduct')}</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'category' ? (
          categoriesLoading ? (
            <Skeleton variant="rounded" height={72} />
          ) : (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  clickable
                  color={categoryId === cat.id ? 'secondary' : 'default'}
                  variant={categoryId === cat.id ? 'filled' : 'outlined'}
                  label={locale === 'ar' ? cat.name_ar : cat.name_en}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSelectedProductId(null);
                  }}
                />
              ))}
            </Stack>
          )
        ) : (
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              value={productQuery}
              onChange={(e) => {
                setProductQuery(e.target.value);
                setSelectedProductId(null);
              }}
              placeholder={t('compare.productPlaceholder')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText={t('compare.productHint')}
            />
            {searchLoading ? <Skeleton variant="rounded" height={80} /> : null}
            {!searchLoading && searchPattern && searchProducts.length === 0 ? (
              <Alert severity="info">{t('search.noResults')}</Alert>
            ) : null}
            <Stack spacing={1}>
              {searchProducts.map((product) => {
                const name = locale === 'ar' ? product.name_ar : product.name_en;
                const brand =
                  locale === 'ar' ? product.brand?.name_ar : product.brand?.name_en;
                const selected = selectedProductId === product.id;
                return (
                  <Paper
                    key={product.id}
                    variant="outlined"
                    sx={{
                      borderColor: selected ? 'primary.main' : undefined,
                      borderWidth: selected ? 2 : 1,
                    }}
                  >
                    <Button
                      fullWidth
                      onClick={() => setSelectedProductId(product.id)}
                      sx={{ justifyContent: 'flex-start', textAlign: 'start', p: 1.5 }}
                    >
                      <Box>
                        <Typography fontWeight={700}>{name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[
                            brand,
                            product.size_value && product.size_unit
                              ? `${product.size_value}${product.size_unit}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </Typography>
                      </Box>
                    </Button>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          3. {t('compare.stepResults')}
        </Typography>

        {selectedSupermarketIds.length === 0 ? (
          <Alert severity="info">{t('compare.needStores')}</Alert>
        ) : mode === 'category' && !categoryId ? (
          <Alert severity="info">{t('compare.needCategory')}</Alert>
        ) : mode === 'product' && !selectedProduct ? (
          <Alert severity="info">{t('compare.needProduct')}</Alert>
        ) : mode === 'product' && selectedProduct ? (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography fontWeight={700}>
                {locale === 'ar' ? selectedProduct.name_ar : selectedProduct.name_en}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    addItem({
                      productId: selectedProduct.id,
                      name_en: selectedProduct.name_en,
                      name_ar: selectedProduct.name_ar,
                      size_value: selectedProduct.size_value,
                      size_unit: selectedProduct.size_unit,
                      brand_en: selectedProduct.brand?.name_en,
                      brand_ar: selectedProduct.brand?.name_ar,
                    })
                  }
                >
                  {getQuantity(selectedProduct.id) > 0
                    ? t('product.addToListAgain', { count: getQuantity(selectedProduct.id) })
                    : t('product.addToList')}
                </Button>
                <Button component={RouterLink} to={`/products/${selectedProduct.id}`} size="small">
                  {t('compare.openProduct')}
                </Button>
              </Stack>
            </Stack>
            <PriceComparisonPanel
              offers={selectedProduct.offers ?? []}
              sizeValue={selectedProduct.size_value}
              sizeUnit={selectedProduct.size_unit}
              showStoreFilter={false}
            />
          </Stack>
        ) : mode === 'category' ? (
          categoryProductsLoading ? (
            <Skeleton variant="rounded" height={200} />
          ) : rankedCategoryProducts.length === 0 ? (
            <Alert severity="info">{t('compare.noCategoryProducts')}</Alert>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                {t('compare.categoryResultsHint')}
              </Typography>
              {rankedCategoryProducts.map(({ product, comparison }) => {
                const name = locale === 'ar' ? product.name_ar : product.name_en;
                return (
                  <Paper key={product.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" gap={1} alignItems="start">
                        <Box>
                          <Typography fontWeight={700}>{name}</Typography>
                          {comparison.best ? (
                            <Typography variant="body2" color="success.dark">
                              {t('product.bestPrice')}:{' '}
                              {locale === 'ar'
                                ? comparison.best.supermarket?.name_ar
                                : comparison.best.supermarket?.name_en}{' '}
                              · {formatSar(comparison.best.effective, locale)}
                              {comparison.saving > 0
                                ? ` · ${t('product.youSave')} ${formatSar(comparison.saving, locale)}`
                                : ''}
                            </Typography>
                          ) : null}
                        </Box>
                        <Stack spacing={0.5}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              addItem({
                                productId: product.id,
                                name_en: product.name_en,
                                name_ar: product.name_ar,
                                size_value: product.size_value,
                                size_unit: product.size_unit,
                                brand_en: product.brand?.name_en,
                                brand_ar: product.brand?.name_ar,
                              })
                            }
                          >
                            {t('product.addToList')}
                          </Button>
                          <Button
                            component={RouterLink}
                            to={`/products/${product.id}`}
                            size="small"
                          >
                            {t('compare.openProduct')}
                          </Button>
                        </Stack>
                      </Stack>
                      <Divider />
                      {comparison.offers.map((offer) => (
                        <Stack key={offer.id} direction="row" justifyContent="space-between">
                          <Typography variant="body2">
                            {locale === 'ar'
                              ? offer.supermarket?.name_ar
                              : offer.supermarket?.name_en}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {formatSar(offer.effective, locale)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )
        ) : null}
      </Paper>
    </Stack>
  );
}
