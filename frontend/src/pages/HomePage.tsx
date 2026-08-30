import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { GET_BEST_DEALS, GET_CATEGORIES, SEARCH_PRODUCTS } from '../graphql/products/queries';
import { ProductCard } from '../features/products/ProductCard';
import { PriceComparisonPanel } from '../features/products/PriceComparisonPanel';
import { SupermarketFilter } from '../components/SupermarketFilter';
import { useAppContext } from '../contexts/AppContext';
import { appConfig } from '../config/app';

const MILK_ID = '44444444-4444-4444-4444-444444444001';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale, selectedSupermarketIds } = useAppContext();
  const [query, setQuery] = useState('');

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: dealsData, loading: dealsLoading } = useQuery(GET_BEST_DEALS, {
    variables: { limit: 12 },
  });
  const { data: milkData, loading: milkLoading, error: milkError } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: '%Almarai Full Fat Milk%', limit: 5 },
  });

  const milkProduct = useMemo(
    () => milkData?.products?.find((p: { id: string }) => p.id === MILK_ID) ?? milkData?.products?.[0],
    [milkData],
  );

  const filteredDeals = useMemo(() => {
    const offers = dealsData?.supermarket_offers ?? [];
    if (!selectedSupermarketIds.length) return [];
    return offers
      .filter((o: { supermarket: { id: string } }) =>
        selectedSupermarketIds.includes(o.supermarket.id),
      )
      .slice(0, 6);
  }, [dealsData, selectedSupermarketIds]);

  return (
    <Stack spacing={3} className="pb-4">
      <section className="pt-2">
        <Typography variant="overline" color="primary.dark">
          {t('app.city')}
        </Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.85rem', sm: '2.25rem' }, mb: 1 }}>
          {locale === 'ar' ? appConfig.nameAr : appConfig.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
          {t('home.headline')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {t('home.subtitle')}
        </Typography>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            }
          }}
          placeholder={t('home.searchPlaceholder')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </section>

      <section>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t('home.categories')}
        </Typography>
        <div className="flex flex-wrap gap-2">
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={88} height={32} />
              ))
            : categoriesData?.product_categories?.map(
                (cat: { id: string; name_en: string; name_ar: string; slug: string }) => (
                  <Chip
                    key={cat.id}
                    label={locale === 'ar' ? cat.name_ar : cat.name_en}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(cat.slug)}`)}
                    clickable
                  />
                ),
              )}
        </div>
      </section>

      <section>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t('product.compareStores')}
        </Typography>
        <SupermarketFilter />
      </section>

      <section>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t('home.validationTitle')}
        </Typography>
        {milkLoading ? (
          <Skeleton variant="rounded" height={220} />
        ) : milkError ? (
          <Alert severity="warning">
            {t('common.error')} — start Hasura and apply seeds (see README).
          </Alert>
        ) : milkProduct ? (
          <Stack spacing={2}>
            <ProductCard product={milkProduct} />
            <PriceComparisonPanel
              offers={milkProduct.offers ?? []}
              sizeValue={milkProduct.size_value}
              sizeUnit={milkProduct.size_unit}
              showStoreFilter={false}
            />
          </Stack>
        ) : (
          <Alert severity="info">{t('search.noResults')}</Alert>
        )}
      </section>

      <section>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t('home.bestDeals')}
        </Typography>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dealsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={120} />
              ))
            : filteredDeals.map(
                (offer: {
                  id: string;
                  product: {
                    id: string;
                    name_en: string;
                    name_ar: string;
                    size_value?: number;
                    size_unit?: string;
                    brand?: { name_en: string; name_ar: string };
                  };
                  offer_price: number;
                  regular_price?: number;
                  is_demo?: boolean;
                  supermarket: { id: string; name_en: string; name_ar: string; slug: string };
                }) => (
                  <ProductCard
                    key={offer.id}
                    product={{
                      ...offer.product,
                      offers: [
                        {
                          id: offer.id,
                          offer_price: offer.offer_price,
                          regular_price: offer.regular_price,
                          is_demo: offer.is_demo,
                          supermarket: offer.supermarket,
                        },
                      ],
                    }}
                  />
                ),
              )}
        </div>
      </section>
    </Stack>
  );
}
