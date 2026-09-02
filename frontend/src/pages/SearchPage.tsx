import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { SEARCH_PRODUCTS, GET_SUPERMARKETS } from '../graphql/products/queries';
import { SearchCompareCard } from '../features/products/SearchCompareCard';
import type { ProductCardProduct } from '../features/products/ProductCard';
import { useAppContext } from '../contexts/AppContext';
import { compareProductOffers } from '../utils/pricing';
import { filterOffersBySelectedStores } from '../contexts/AppContext';
import { supermarketShortName } from '../utils/supermarketBranding';
import { SupermarketFilter } from '../components/SupermarketFilter';

export function SearchPage() {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const [storeFilter, setStoreFilter] = useState<string | 'all'>('all');

  const searchPattern = useMemo(() => {
    const trimmed = q.trim();
    if (!trimmed) return '%';
    return `%${trimmed}%`;
  }, [q]);

  const { data: storesData } = useQuery(GET_SUPERMARKETS);
  const { data, loading, error } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: searchPattern, limit: 40 },
    skip: !q.trim() && !category,
  });

  const stores = storesData?.supermarkets ?? [];

  const products = useMemo(() => {
    let list = (data?.products ?? []) as ProductCardProduct[];
    if (category) {
      list = list.filter((p) => (p as { category?: { slug?: string } }).category?.slug === category);
    }
    // When browsing by category only (empty q), still show category products via broader search
    return list;
  }, [data, category]);

  // If only category is set, fetch with wildcard
  const { data: categoryBrowse, loading: categoryLoading } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: '%', limit: 40 },
    skip: !category || !!q.trim(),
  });

  const displayProducts = useMemo(() => {
    const source = (
      category && !q.trim() ? categoryBrowse?.products ?? [] : products
    ) as ProductCardProduct[];

    let list = source;
    if (category) {
      list = list.filter((p) => (p as { category?: { slug?: string } }).category?.slug === category);
    }

    // Sort by best price among selected stores
    return [...list].sort((a, b) => {
      const ca = compareProductOffers(
        filterOffersBySelectedStores(a.offers ?? [], selectedSupermarketIds),
      );
      const cb = compareProductOffers(
        filterOffersBySelectedStores(b.offers ?? [], selectedSupermarketIds),
      );
      return (ca.best?.effective ?? Number.POSITIVE_INFINITY) - (cb.best?.effective ?? Number.POSITIVE_INFINITY);
    });
  }, [products, categoryBrowse, category, q, selectedSupermarketIds]);

  const isLoading = loading || categoryLoading;
  const hasQuery = Boolean(q.trim() || category);

  return (
    <Stack spacing={2} className="pb-4">
      <Typography variant="h5" fontWeight={900}>
        {t('search.title')}
      </Typography>

      <TextField
        fullWidth
        autoFocus
        value={q}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value) next.set('q', e.target.value);
          else next.delete('q');
          setParams(next);
        }}
        placeholder={t('search.placeholder')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <SupermarketFilter dense />

      {hasQuery && stores.length ? (
        <Box className="hide-scrollbar" sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5 }}>
          <Chip
            label={t('search.filterAll')}
            clickable
            color={storeFilter === 'all' ? 'primary' : 'default'}
            onClick={() => setStoreFilter('all')}
            sx={{ fontWeight: 800 }}
          />
          {stores
            .filter((s: { id: string }) =>
              selectedSupermarketIds.length ? selectedSupermarketIds.includes(s.id) : true,
            )
            .map((s: { id: string; name_en: string; name_ar: string; slug: string }) => (
              <Chip
                key={s.id}
                label={supermarketShortName(s, locale)}
                clickable
                color={storeFilter === s.id ? 'primary' : 'default'}
                onClick={() => setStoreFilter(s.id)}
                sx={{ fontWeight: 700 }}
              />
            ))}
        </Box>
      ) : null}

      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {t('search.sortCheapest')}
      </Typography>

      {!hasQuery ? (
        <Alert severity="info">{t('search.hint')}</Alert>
      ) : isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 3 }} />
        ))
      ) : error ? (
        <Alert severity="error">{t('common.error')}</Alert>
      ) : displayProducts.length ? (
        <Stack spacing={1.75}>
          {displayProducts.map((product) => (
            <SearchCompareCard
              key={product.id}
              product={product}
              storeFilterId={storeFilter === 'all' ? null : storeFilter}
            />
          ))}
        </Stack>
      ) : (
        <Alert severity="warning">{t('search.noResults')}</Alert>
      )}
    </Stack>
  );
}
