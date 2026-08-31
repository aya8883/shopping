import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalDrinkOutlinedIcon from '@mui/icons-material/LocalDrinkOutlined';
import EggAltOutlinedIcon from '@mui/icons-material/EggAltOutlined';
import SetMealOutlinedIcon from '@mui/icons-material/SetMealOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GET_BEST_DEALS, GET_CATEGORIES } from '../graphql/products/queries';
import { DealCard, type DealOffer } from '../features/products/DealCard';
import { SectionHeader } from '../components/ui/Surface';
import { useAppContext } from '../contexts/AppContext';
import { formatSar } from '../utils/pricing';
import { SupermarketAvatar } from '../components/SupermarketMark';
import { supermarketShortName } from '../utils/supermarketBranding';

const CATEGORY_STYLE: Record<
  string,
  { icon: SvgIconComponent; bg: string; fg: string }
> = {
  dairy: { icon: LocalDrinkOutlinedIcon, bg: '#E0F2FE', fg: '#0284C7' },
  'meat-poultry': { icon: SetMealOutlinedIcon, bg: '#FFE4E6', fg: '#E11D48' },
  'rice-grains': { icon: GrainOutlinedIcon, bg: '#FEF3C7', fg: '#D97706' },
  'cooking-oil': { icon: OpacityOutlinedIcon, bg: '#FFEDD5', fg: '#EA580C' },
  beverages: { icon: LocalCafeOutlinedIcon, bg: '#EDE9FE', fg: '#7C3AED' },
  cleaning: { icon: CleaningServicesOutlinedIcon, bg: '#DCFCE7', fg: '#16A34A' },
  'personal-care': { icon: SpaOutlinedIcon, bg: '#FCE7F3', fg: '#DB2777' },
  eggs: { icon: EggAltOutlinedIcon, bg: '#FEF9C3', fg: '#CA8A04' },
};

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale, selectedSupermarketIds } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: dealsData, loading: dealsLoading } = useQuery(GET_BEST_DEALS, {
    variables: { limit: 12 },
  });

  const categories = categoriesData?.product_categories ?? [];

  const filteredDeals = useMemo(() => {
    const offers = dealsData?.supermarket_offers ?? [];
    if (!selectedSupermarketIds.length) return [];
    return offers
      .filter((o: { supermarket: { id: string } }) =>
        selectedSupermarketIds.includes(o.supermarket.id),
      )
      .slice(0, 6);
  }, [dealsData, selectedSupermarketIds]);

  const demoSavings = useMemo(() => {
    const offers = filteredDeals as Array<{
      offer_price: number;
      regular_price?: number | null;
      supermarket: { slug: string; name_en: string; name_ar: string; logo_url?: string | null };
    }>;
    let saved = 0;
    let compared = 0;
    for (const o of offers) {
      if (o.regular_price && Number(o.regular_price) > Number(o.offer_price)) {
        saved += Number(o.regular_price) - Number(o.offer_price);
        compared += 1;
      }
    }
    const topStore = offers[0]?.supermarket;
    return {
      saved: saved || 12.55,
      compared: compared || offers.length || 4,
      topStore,
    };
  }, [filteredDeals]);

  return (
    <Stack spacing={2.5} className="pb-4">
      <Box
        className="animate-soft-rise"
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: '1.4fr 0.9fr' },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            minHeight: { xs: 210, sm: 240 },
            p: { xs: 2.25, sm: 3 },
            background: 'linear-gradient(135deg, #FFE566 0%, #F5C400 55%, #F59E0B 120%)',
            boxShadow: '0 16px 36px rgba(245,196,0,0.28)',
          }}
        >
          <Box
            component="img"
            src="/hero-basket.svg"
            alt=""
            sx={{
              position: 'absolute',
              width: { xs: 150, sm: 190 },
              bottom: -8,
              insetInlineEnd: { xs: -10, sm: 8 },
              opacity: 0.95,
              pointerEvents: 'none',
            }}
          />
          <Stack spacing={1.25} sx={{ position: 'relative', zIndex: 1, maxWidth: 320 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.45rem', sm: '1.75rem' },
                lineHeight: 1.2,
                color: '#1A1A1A',
              }}
            >
              {t('home.headline')}
            </Typography>
            <Typography sx={{ color: 'rgba(26,26,26,0.75)', fontWeight: 600, maxWidth: 280 }}>
              {t('home.subtitle')}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: 'rgba(255,255,255,0.85)',
                  borderRadius: 2,
                  px: 1,
                  py: 0.75,
                }}
              >
                <SupermarketAvatar
                  store={{ slug: 'carrefour', name_en: 'Carrefour', name_ar: 'كارفور' }}
                  size="sm"
                />
                <Box>
                  <Typography variant="caption" fontWeight={700} display="block" lineHeight={1.1}>
                    {supermarketShortName({ slug: 'carrefour' }, locale)}
                  </Typography>
                  <Typography fontWeight={900} fontSize="0.95rem" color="success.dark">
                    9.95
                  </Typography>
                </Box>
              </Box>
              <Typography fontWeight={800} color="rgba(26,26,26,0.55)">
                VS
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: 'rgba(255,255,255,0.55)',
                  borderRadius: 2,
                  px: 1,
                  py: 0.75,
                }}
              >
                <SupermarketAvatar
                  store={{ slug: 'lulu', name_en: 'LuLu', name_ar: 'لولو' }}
                  size="sm"
                />
                <Box>
                  <Typography variant="caption" fontWeight={700} display="block" lineHeight={1.1}>
                    {supermarketShortName({ slug: 'lulu' }, locale)}
                  </Typography>
                  <Typography fontWeight={800} fontSize="0.95rem">
                    10.50
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Button
              component={RouterLink}
              to="/compare"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                alignSelf: 'flex-start',
                mt: 0.5,
                bgcolor: '#1A1A1A',
                color: '#fff',
                '&:hover': { bgcolor: '#111' },
                boxShadow: '0 8px 18px rgba(0,0,0,0.2)',
              }}
            >
              {t('home.startComparing')}
            </Button>
          </Stack>
        </Box>

        <Box
          className="animate-soft-rise delay-1"
          sx={{
            borderRadius: 4,
            p: 2.25,
            bgcolor: '#fff',
            border: '1px solid rgba(26,26,26,0.06)',
            boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: '#DCFCE7',
                color: 'success.main',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <SavingsOutlinedIcon />
            </Box>
            <Typography fontWeight={800}>{t('home.savingsTitle')}</Typography>
          </Stack>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '2rem',
              color: 'success.main',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              mb: 2,
            }}
          >
            {formatSar(demoSavings.saved, locale)}
          </Typography>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CompareArrowsOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {t('home.productsCompared', { count: demoSavings.compared })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <StorefrontOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {t('home.cheapestOften')}:{' '}
                <Box component="span" fontWeight={800} color="text.primary">
                  {demoSavings.topStore
                    ? supermarketShortName(demoSavings.topStore, locale)
                    : supermarketShortName({ slug: 'carrefour' }, locale)}
                </Box>
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <section className="animate-soft-rise delay-2">
        <SectionHeader
          title={t('home.categories')}
          action={
            <Button
              size="small"
              onClick={() => navigate('/compare')}
              sx={{ fontWeight: 800, color: 'text.secondary' }}
            >
              {t('home.viewAll')}
            </Button>
          }
        />
        <Box className="hide-scrollbar" sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', pb: 0.5 }}>
          <CategoryTile
            label={t('home.allCategories')}
            selected={activeCategory === 'all'}
            bg="#FFF8D6"
            fg="#D4A800"
            icon={AppsOutlinedIcon}
            onClick={() => setActiveCategory('all')}
          />
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={78} height={86} sx={{ flexShrink: 0, borderRadius: 3 }} />
              ))
            : categories.map(
                (cat: { id: string; name_en: string; name_ar: string; slug: string }) => {
                  const style = CATEGORY_STYLE[cat.slug] ?? {
                    icon: AppsOutlinedIcon,
                    bg: '#F3F4F6',
                    fg: '#4B5563',
                  };
                  return (
                    <CategoryTile
                      key={cat.id}
                      label={locale === 'ar' ? cat.name_ar : cat.name_en}
                      selected={activeCategory === cat.id}
                      bg={style.bg}
                      fg={style.fg}
                      icon={style.icon}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        navigate('/compare');
                      }}
                    />
                  );
                },
              )}
        </Box>
      </section>

      <section className="animate-soft-rise delay-3">
        <SectionHeader
          title={t('home.bestDeals')}
          action={
            <Button
              component={RouterLink}
              to="/offers"
              size="small"
              sx={{ fontWeight: 800, color: 'text.secondary' }}
            >
              {t('home.viewAll')}
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
    </Stack>
  );
}

function CategoryTile({
  label,
  selected,
  bg,
  fg,
  icon: Icon,
  onClick,
}: {
  label: string;
  selected: boolean;
  bg: string;
  fg: string;
  icon: SvgIconComponent;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: '0 0 auto',
        width: 78,
        borderRadius: 3,
        p: 1,
        bgcolor: selected ? '#FFF8D6' : '#fff',
        border: selected ? '2px solid #F5C400' : '1px solid rgba(26,26,26,0.06)',
        boxShadow: '0 6px 16px rgba(15,23,42,0.04)',
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
        fontSize="0.7rem"
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
