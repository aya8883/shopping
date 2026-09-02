import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import LocalDrinkOutlinedIcon from '@mui/icons-material/LocalDrinkOutlined';
import SetMealOutlinedIcon from '@mui/icons-material/SetMealOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import EggAltOutlinedIcon from '@mui/icons-material/EggAltOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GET_BEST_DEALS, GET_CATEGORIES } from '../graphql/products/queries';
import { GET_PRODUCTS_FOR_BASKET } from '../graphql/products/basket';
import { DealCard, type DealOffer } from '../features/products/DealCard';
import { SectionHeader } from '../components/ui/Surface';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { compareBasket } from '../utils/basket';
import { formatSar } from '../utils/pricing';

const CATEGORY_STYLE: Record<string, { icon: SvgIconComponent; bg: string; fg: string }> = {
  dairy: { icon: LocalDrinkOutlinedIcon, bg: '#E0F2FE', fg: '#0284C7' },
  'meat-poultry': { icon: SetMealOutlinedIcon, bg: '#FFE4E6', fg: '#E11D48' },
  'rice-grains': { icon: GrainOutlinedIcon, bg: '#FEF3C7', fg: '#D97706' },
  'cooking-oil': { icon: OpacityOutlinedIcon, bg: '#FFEDD5', fg: '#EA580C' },
  beverages: { icon: LocalCafeOutlinedIcon, bg: '#EDE9FE', fg: '#7C3AED' },
  cleaning: { icon: CleaningServicesOutlinedIcon, bg: '#DCFCE7', fg: '#16A34A' },
  'personal-care': { icon: SpaOutlinedIcon, bg: '#FCE7F3', fg: '#DB2777' },
  'fruits-vegetables': { icon: SpaOutlinedIcon, bg: '#DCFCE7', fg: '#15803D' },
  eggs: { icon: EggAltOutlinedIcon, bg: '#FEF9C3', fg: '#CA8A04' },
};

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { items, itemCount } = useBasket();

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: dealsData, loading: dealsLoading } = useQuery(GET_BEST_DEALS, {
    variables: { limit: 12 },
  });

  const basketIds = useMemo(() => items.map((i) => i.productId), [items]);
  const { data: basketPrices } = useQuery(GET_PRODUCTS_FOR_BASKET, {
    variables: { ids: basketIds },
    skip: basketIds.length === 0,
  });

  const categories = (categoriesData?.product_categories ?? []).slice(0, 4);

  const filteredDeals = useMemo(() => {
    const offers = dealsData?.supermarket_offers ?? [];
    if (!selectedSupermarketIds.length) return offers.slice(0, 4);
    return offers
      .filter((o: { supermarket: { id: string } }) =>
        selectedSupermarketIds.includes(o.supermarket.id),
      )
      .slice(0, 4);
  }, [dealsData, selectedSupermarketIds]);

  const basketPreview = useMemo(() => {
    if (!items.length || !basketPrices?.products?.length) return null;
    const result = compareBasket({
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      products: basketPrices.products,
      storeIds: selectedSupermarketIds.length ? selectedSupermarketIds : undefined,
    });
    return {
      bestTotal: result.best?.total ?? null,
      saving: result.saving,
    };
  }, [items, basketPrices, selectedSupermarketIds]);

  return (
    <Stack spacing={2.5} className="pb-4">
      <TextField
        fullWidth
        placeholder={t('home.searchPlaceholder')}
        onClick={() => navigate('/search')}
        onFocus={() => navigate('/search')}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#fff',
            borderRadius: 3,
            height: 48,
            cursor: 'pointer',
          },
        }}
      />

      <Box
        className="animate-soft-rise"
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          background: 'linear-gradient(160deg, #FFF8D6 0%, #FFE566 45%, #F5C400 100%)',
          boxShadow: '0 14px 32px rgba(245,196,0,0.22)',
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: '1.45rem', sm: '1.7rem' },
            lineHeight: 1.25,
            color: '#1A1A1A',
            mb: 1,
          }}
        >
          {t('home.headline')}
        </Typography>
        <Typography sx={{ color: 'rgba(26,26,26,0.72)', fontWeight: 600, mb: 2.25, maxWidth: 340, mx: 'auto' }}>
          {t('home.subtitle')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/search')}
          sx={{
            bgcolor: '#1A1A1A',
            color: '#fff',
            px: 3,
            '&:hover': { bgcolor: '#111' },
            boxShadow: '0 8px 18px rgba(0,0,0,0.2)',
          }}
        >
          {t('home.startBasket')}
        </Button>
      </Box>

      <section className="animate-soft-rise delay-1">
        <SectionHeader
          title={t('home.categories')}
          action={
            <Button size="small" onClick={() => navigate('/search')} sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {t('home.viewAll')}
            </Button>
          }
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={86} sx={{ borderRadius: 3 }} />
              ))
            : categories.map((cat: { id: string; name_en: string; name_ar: string; slug: string }) => {
                const style = CATEGORY_STYLE[cat.slug] ?? {
                  icon: AppsOutlinedIcon,
                  bg: '#F3F4F6',
                  fg: '#4B5563',
                };
                return (
                  <CategoryTile
                    key={cat.id}
                    label={locale === 'ar' ? cat.name_ar : cat.name_en}
                    bg={style.bg}
                    fg={style.fg}
                    icon={style.icon}
                    onClick={() => navigate(`/search?category=${encodeURIComponent(cat.slug)}`)}
                  />
                );
              })}
        </Box>
      </section>

      <section className="animate-soft-rise delay-2">
        <SectionHeader
          title={t('home.bestDeals')}
          action={
            <Button component={RouterLink} to="/offers" size="small" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {t('home.viewAllOffers')}
            </Button>
          }
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1.5,
          }}
        >
          {dealsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={112} sx={{ borderRadius: 3 }} />
              ))
            : filteredDeals.map((offer: DealOffer) => <DealCard key={offer.id} offer={offer} />)}
        </Box>
      </section>

      {itemCount > 0 ? (
        <Box
          className="animate-soft-rise delay-3"
          sx={{
            borderRadius: 4,
            p: 2.25,
            bgcolor: '#fff',
            border: '1px solid rgba(26,26,26,0.08)',
            boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
            <ShoppingCartOutlinedIcon color="primary" />
            <Typography fontWeight={900}>{t('home.yourBasket')}</Typography>
          </Stack>
          <Typography color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
            {t('home.basketCount', { count: itemCount })}
          </Typography>
          {basketPreview?.bestTotal != null ? (
            <>
              <Typography fontWeight={800}>
                {t('home.expectedBest')}: {formatSar(basketPreview.bestTotal, locale)}
              </Typography>
              {basketPreview.saving > 0 ? (
                <Typography color="success.main" fontWeight={800} sx={{ mt: 0.25 }}>
                  {t('home.expectedSaving')}: {formatSar(basketPreview.saving, locale)}
                </Typography>
              ) : null}
            </>
          ) : null}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/list')}
          >
            {t('home.openSmartBasket')}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}

function CategoryTile({
  label,
  bg,
  fg,
  icon: Icon,
  onClick,
}: {
  label: string;
  bg: string;
  fg: string;
  icon: SvgIconComponent;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        borderRadius: 3,
        p: 1,
        bgcolor: '#fff',
        border: '1px solid rgba(26,26,26,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: bg,
          color: fg,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Typography
        fontSize="0.72rem"
        fontWeight={800}
        textAlign="center"
        lineHeight={1.2}
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}
