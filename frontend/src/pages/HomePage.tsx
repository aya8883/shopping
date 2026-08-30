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
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { GET_BEST_DEALS, GET_CATEGORIES, SEARCH_PRODUCTS } from '../graphql/products/queries';
import { ProductCard } from '../features/products/ProductCard';
import { PriceComparisonPanel } from '../features/products/PriceComparisonPanel';
import { SupermarketFilter } from '../components/SupermarketFilter';
import { SectionHeader, Surface } from '../components/ui/Surface';
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
      <Surface accent className="animate-soft-rise">
        <Typography
          variant="overline"
          sx={{ color: 'primary.dark', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.main',
              display: 'inline-block',
            }}
          />
          {t('app.city')}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '2rem', sm: '2.4rem' },
            mb: 0.75,
            mt: 0.5,
            lineHeight: 1.15,
          }}
        >
          {locale === 'ar' ? appConfig.nameAr : appConfig.name}
        </Typography>
        <Typography
          sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '1.05rem' }}
        >
          {t('home.headline')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 420 }}>
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
          <Button
            component={RouterLink}
            to="/compare"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            fullWidth
          >
            {t('compare.title')}
          </Button>
          <Button component={RouterLink} to="/offers" variant="outlined" size="large" fullWidth>
            {t('offers.weekly')}
          </Button>
        </Stack>
      </Surface>

      <section className="animate-soft-rise delay-1">
        <SectionHeader title={t('home.categories')} />
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
            mx: -0.5,
            px: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={96} height={36} sx={{ flexShrink: 0 }} />
              ))
            : categoriesData?.product_categories?.map(
                (cat: { id: string; name_en: string; name_ar: string; slug: string }) => (
                  <Chip
                    key={cat.id}
                    label={locale === 'ar' ? cat.name_ar : cat.name_en}
                    onClick={() => navigate(`/compare`)}
                    clickable
                    sx={{
                      flexShrink: 0,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      border: '1px solid rgba(13,148,136,0.14)',
                    }}
                  />
                ),
              )}
        </Box>
      </section>

      <section className="animate-soft-rise delay-2">
        <SectionHeader title={t('product.compareStores')} subtitle={t('compare.subtitle')} />
        <Surface>
          <SupermarketFilter dense />
        </Surface>
      </section>

      <section className="animate-soft-rise delay-3">
        <SectionHeader title={t('home.validationTitle')} />
        {milkLoading ? (
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
        ) : milkError ? (
          <Alert severity="warning">
            {t('common.error')} — start Hasura and apply seeds (see README).
          </Alert>
        ) : milkProduct ? (
          <Stack spacing={2}>
            <ProductCard product={milkProduct} />
            <Surface>
              <PriceComparisonPanel
                offers={milkProduct.offers ?? []}
                sizeValue={milkProduct.size_value}
                sizeUnit={milkProduct.size_unit}
                showStoreFilter={false}
              />
            </Surface>
          </Stack>
        ) : (
          <Alert severity="info">{t('search.noResults')}</Alert>
        )}
      </section>

      <section>
        <SectionHeader title={t('home.bestDeals')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dealsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={128} sx={{ borderRadius: 3 }} />
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
