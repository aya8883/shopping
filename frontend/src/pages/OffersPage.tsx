import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { GET_CURRENT_LEAFLETS } from '../graphql/leaflets/queries';
import { GET_BEST_DEALS } from '../graphql/products/queries';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { SupermarketAvatar } from '../components/SupermarketMark';
import { LeafletViewer, type LeafletPage } from '../components/LeafletViewer';
import { WeeklyPromoGrid, type PromoOffer } from '../components/WeeklyPromoGrid';
import { ProductQuickAdd } from '../components/ProductQuickAdd';
import { BetterPriceSnackbar } from '../components/BetterPriceSnackbar';
import { DealCard, type DealOffer } from '../features/products/DealCard';
import type { LeafletOfferHotspot } from '../data/leafletHotspots';
import { storeProductImageUrl } from '../data/storeProductImages';
import { flyerProductsForStore, getCanonicalProduct, getLeafletHotspots, savingsVsStore } from '../data/leafletHotspots';
import {
  supermarketBrandColors,
  supermarketShortName,
} from '../utils/supermarketBranding';
import { flyerFreshnessLabel } from '../utils/flyerFreshness';
import { formatSar } from '../utils/pricing';
import { assetUrl } from '../utils/assetUrl';
type Leaflet = {
  id: string;
  title_en: string;
  title_ar: string;
  start_date: string;
  end_date: string;
  city: string;
  source_url?: string | null;
  supermarket: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    logo_url?: string | null;
  };
  pages?: LeafletPage[];
  offers: PromoOffer[];
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatRange(start: string, end: string, locale: string): string {
  const dfLocale = locale === 'ar' ? arSA : enUS;
  const pattern = locale === 'ar' ? 'd MMM' : 'd MMM';
  try {
    return `${format(parseISO(start), pattern, { locale: dfLocale })} – ${format(parseISO(end), pattern, { locale: dfLocale })}`;
  } catch {
    return `${start} – ${end}`;
  }
}

function storeAccent(slug?: string | null) {
  const brand = supermarketBrandColors({ slug: slug ?? '' });
  const soft = `linear-gradient(145deg, ${brand.bg}22, rgba(255,255,255,0.95) 60%)`;
  return {
    soft,
    ring: `${brand.bg}55`,
    chip: brand.bg,
    fg: brand.fg,
  };
}

export function OffersPage() {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { addItem, getQuantity } = useBasket();
  const [viewMode, setViewMode] = useState<'flyers' | 'deals'>('flyers');
  const [dealSort, setDealSort] = useState<'latest' | 'savings'>('savings');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<LeafletOfferHotspot | null>(null);
  const [toastName, setToastName] = useState<string | null>(null);
  const [betterPrice, setBetterPrice] = useState<{
    productName: string;
    currentPrice: number;
    best: { supermarketSlug: string; supermarketNameEn: string; supermarketNameAr: string; price: number };
    savings: number;
  } | null>(null);

  const { data, loading, error } = useQuery(GET_CURRENT_LEAFLETS, {
    variables: { today: todayIso() },
  });
  const { data: dealsData, loading: dealsLoading } = useQuery(GET_BEST_DEALS, {
    variables: { limit: 48 },
  });

  const leaflets: Leaflet[] = data?.leaflets ?? [];
  const active = leaflets[tab] ?? leaflets[0];
  const accent = storeAccent(active?.supermarket.slug);

  const offerCountLabel = useMemo(() => {
    if (!active) return '';
    return t('offers.offerCount', { count: active.offers.length });
  }, [active, t]);

  const trendingDeals = useMemo(() => {
    const offers = (dealsData?.supermarket_offers ?? []) as DealOffer[];
    const scoped = selectedSupermarketIds.length
      ? offers.filter((o) => selectedSupermarketIds.includes(o.supermarket.id))
      : offers;
    const needle = searchQuery.trim().toLowerCase();
    const filtered = needle
      ? scoped.filter((o) => {
          const hay = [
            o.product.name_en,
            o.product.name_ar,
            o.product.brand?.name_en,
            o.product.brand?.name_ar,
            o.supermarket.name_en,
            o.supermarket.name_ar,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return hay.includes(needle);
        })
      : scoped;

    const withSavings = filtered.map((o) => {
      const regular = o.regular_price != null ? Number(o.regular_price) : null;
      const offer = Number(o.offer_price);
      const savings =
        regular != null && regular > offer ? regular - offer : 0;
      const pct = regular != null && regular > 0 ? savings / regular : 0;
      return { offer: o, savings, pct };
    });

    withSavings.sort((a, b) =>
      dealSort === 'savings'
        ? b.pct - a.pct || b.savings - a.savings
        : a.offer.id.localeCompare(b.offer.id),
    );
    return withSavings.map((x) => x.offer).slice(0, 24);
  }, [dealsData, selectedSupermarketIds, searchQuery, dealSort]);

  const filteredActiveOffers = useMemo(() => {
    if (!active) return [];
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return active.offers;
    return active.offers.filter((o) => {
      const hay = [
        o.product.name_en,
        o.product.name_ar,
        o.product.brand?.name_en,
        o.product.brand?.name_ar,
        o.promotion_description_en,
        o.promotion_description_ar,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [active, searchQuery]);

  /** Apollo query omits hotspots until Hasura schema adds them — load from local/mock data. */
  const leafletPages = useMemo((): LeafletPage[] => {
    if (!active?.pages?.length) return [];
    const slug = active.supermarket.slug;
    return active.pages.map((page) => ({
      ...page,
      hotspots:
        page.hotspots?.length
          ? page.hotspots
          : getLeafletHotspots(slug, page.page_number),
    }));
  }, [active]);

  const flyerProducts = useMemo(() => {
    if (!active) return [];
    return flyerProductsForStore(active.supermarket.slug);
  }, [active]);

  const filteredFlyerProducts = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return flyerProducts;
    return flyerProducts.filter((h) =>
      `${h.name} ${h.nameAr}`.toLowerCase().includes(needle),
    );
  }, [flyerProducts, searchQuery]);

  const freshness = useMemo(() => {
    if (!active) return null;
    return flyerFreshnessLabel(active.end_date, t);
  }, [active, t]);
  const addPromoToBasket = (offer: PromoOffer) => {
    if (!active) return;
    const descEn = [
      offer.promotion_description_en,
      offer.product.package_description_en,
      offer.product.size_value && offer.product.size_unit
        ? `${offer.product.size_value}${offer.product.size_unit}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const descAr = [
      offer.promotion_description_ar,
      offer.product.package_description_ar,
      offer.product.size_value && offer.product.size_unit
        ? `${offer.product.size_value}${offer.product.size_unit}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ');

    addItem({
      productId: offer.product.id,
      name_en: offer.product.name_en,
      name_ar: offer.product.name_ar,
      size_value: offer.product.size_value,
      size_unit: offer.product.size_unit,
      brand_en: offer.product.brand?.name_en,
      brand_ar: offer.product.brand?.name_ar,
      addedFromSupermarketId: active.supermarket.id,
      supermarket_name_en: active.supermarket.name_en,
      supermarket_name_ar: active.supermarket.name_ar,
      offer_price: Number(offer.offer_price),
      regular_price: offer.regular_price != null ? Number(offer.regular_price) : null,
      description_en: descEn,
      description_ar: descAr,
      image_url: offer.image_url ?? offer.product.image_url,
    });
    setToastName(locale === 'ar' ? offer.product.name_ar : offer.product.name_en);
  };

  const confirmHotspotAdd = (hotspot: LeafletOfferHotspot, quantity: number) => {
    if (!active) return;
    const canonical = getCanonicalProduct(hotspot.productId);

    addItem({
      productId: hotspot.productId,
      name_en: canonical?.name_en ?? hotspot.name,
      name_ar: canonical?.name_ar ?? hotspot.nameAr,
      size_value: canonical?.size_value,
      size_unit: canonical?.size_unit,
      brand_en: canonical?.brand_en,
      brand_ar: canonical?.brand_ar,
      addedFromSupermarketId: active.supermarket.id,
      supermarket_name_en: active.supermarket.name_en,
      supermarket_name_ar: active.supermarket.name_ar,
      offer_price: hotspot.price,
      regular_price: hotspot.oldPrice ?? null,
      description_en: `${hotspot.unit} · ${active.supermarket.name_en}`,
      description_ar: `${hotspot.unitAr} · ${active.supermarket.name_ar}`,
      image_url: storeProductImageUrl(
        hotspot.productId,
        active.supermarket.slug,
        canonical?.image_url,
      ),
      quantity,
    });

    const name = locale === 'ar' ? hotspot.nameAr : hotspot.name;
    setToastName(name);

    const hint = savingsVsStore(hotspot.productId, active.supermarket.slug, hotspot.price);
    if (hint) {
      setBetterPrice({
        productName: name,
        currentPrice: hotspot.price,
        best: {
          supermarketSlug: hint.best.supermarketSlug,
          supermarketNameEn: hint.best.supermarketNameEn,
          supermarketNameAr: hint.best.supermarketNameAr,
          price: hint.best.price,
        },
        savings: hint.savings,
      });
    }
  };

  if (loading) {
    return (
      <Stack spacing={2} className="pb-4">
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={800}>
          {t('offers.title')}
        </Typography>
        <Alert severity="error">{t('common.error')}</Alert>
      </Stack>
    );
  }

  if (!leaflets.length) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={800}>
          {t('offers.title')}
        </Typography>
        <Alert severity="info">{t('offers.noLeaflets')}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} className="pb-4 animate-fade-in">
      <Box
        className="animate-soft-rise"
        sx={{
          borderRadius: 4,
          p: { xs: 2.25, sm: 2.75 },
          background: 'linear-gradient(135deg, #FFE566 0%, #F5C400 70%)',
          boxShadow: '0 16px 36px rgba(245,196,0,0.28)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(0,0,0,0.08)',
            }}
          >
            <LocalOfferOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="overline" fontWeight={800} color="rgba(26,26,26,0.75)">
            {t('offers.weekly')}
          </Typography>
        </Stack>
        <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', lineHeight: 1.2, mb: 0.5 }}>
          {t('offers.title')}
        </Typography>
        <Typography fontWeight={600} color="rgba(26,26,26,0.72)">
          {t('offers.weeklyThisWeek')}
        </Typography>
      </Box>

      <Tabs
        value={viewMode}
        onChange={(_e, value: 'flyers' | 'deals') => setViewMode(value)}
        variant="fullWidth"
        sx={{
          minHeight: 48,
          bgcolor: '#fff',
          borderRadius: 3,
          border: '1px solid rgba(26,26,26,0.08)',
          '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', minHeight: 48 },
          '& .Mui-selected': { color: '#1A1A1A' },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 2, bgcolor: '#F5C400' },
        }}
      >
        <Tab
          value="flyers"
          icon={<AutoStoriesOutlinedIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={t('offers.tabFlyers')}
        />
        <Tab
          value="deals"
          icon={<TrendingUpOutlinedIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={t('offers.tabDeals')}
        />
      </Tabs>

      <TextField
        fullWidth
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('offers.searchPlaceholder')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          '& .MuiOutlinedInput-root': { borderRadius: 3 },
        }}
      />

      {viewMode === 'deals' ? (
        <Stack spacing={1.5} className="animate-soft-rise">
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              clickable
              label={t('offers.sortSavings')}
              onClick={() => setDealSort('savings')}
              sx={{
                fontWeight: 800,
                bgcolor: dealSort === 'savings' ? '#F5C400' : '#fff',
                border: '1px solid rgba(26,26,26,0.1)',
              }}
            />
            <Chip
              clickable
              label={t('offers.sortLatest')}
              onClick={() => setDealSort('latest')}
              sx={{
                fontWeight: 800,
                bgcolor: dealSort === 'latest' ? '#F5C400' : '#fff',
                border: '1px solid rgba(26,26,26,0.1)',
              }}
            />
          </Stack>
          <Typography variant="h6" fontWeight={900}>
            {t('offers.trendingTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {t('offers.trendingHint')}
          </Typography>
          {dealsLoading ? (
            <Stack spacing={1.25}>
              <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
            </Stack>
          ) : trendingDeals.length ? (
            <Stack spacing={1.25}>
              {trendingDeals.map((offer) => (
                <DealCard key={offer.id} offer={offer} />
              ))}
            </Stack>
          ) : (
            <Alert severity="info">{t('offers.noDealMatches')}</Alert>
          )}
        </Stack>
      ) : (
        <>
      <Typography variant="overline" fontWeight={800} color="text.secondary">
        {t('offers.storesStrip')}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          pb: 0.5,
          mx: -0.5,
          px: 0.5,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {leaflets.map((leaflet, index) => {
          const selected = index === tab;
          const colors = supermarketBrandColors(leaflet.supermarket);
          const name = supermarketShortName(leaflet.supermarket, locale);
          const cardFresh = flyerFreshnessLabel(leaflet.end_date, t);
          return (
            <ButtonBase
              key={`strip-${leaflet.id}`}
              onClick={() => setTab(index)}
              aria-pressed={selected}
              sx={{
                flex: '0 0 auto',
                minWidth: 92,
                borderRadius: 3,
                px: 1.25,
                py: 1,
                border: '2px solid',
                borderColor: selected ? colors.bg : 'rgba(26,26,26,0.08)',
                bgcolor: selected ? `${colors.bg}14` : '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <SupermarketAvatar store={leaflet.supermarket} size="sm" />
              <Typography fontWeight={800} fontSize="0.72rem" noWrap sx={{ maxWidth: 84 }}>
                {name}
              </Typography>
              {cardFresh ? (
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    color:
                      cardFresh.tone === 'error'
                        ? '#B91C1C'
                        : cardFresh.tone === 'warning'
                          ? '#D97706'
                          : '#15803D',
                    fontSize: '0.62rem',
                  }}
                >
                  {cardFresh.label}
                </Typography>
              ) : null}
            </ButtonBase>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
        {leaflets.map((leaflet, index) => {
          const selected = index === tab;
          const colors = supermarketBrandColors(leaflet.supermarket);
          const name = supermarketShortName(leaflet.supermarket, locale);
          const cardFresh = flyerFreshnessLabel(leaflet.end_date, t);
          const cover = leaflet.pages?.[0]?.image_url;
          return (
            <ButtonBase
              key={leaflet.id}
              onClick={() => setTab(index)}
              aria-pressed={selected}
              sx={{
                flex: '1 1 160px',
                maxWidth: { xs: '100%', sm: 220 },
                borderRadius: 3,
                overflow: 'hidden',
                textAlign: 'start',
                border: '2px solid',
                borderColor: selected ? colors.bg : 'rgba(26,26,26,0.08)',
                background: '#fff',
                boxShadow: selected
                  ? `0 14px 32px ${colors.bg}40`
                  : '0 6px 18px rgba(15,23,42,0.06)',
                display: 'block',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: 88,
                  background: `linear-gradient(145deg, ${colors.bg}33, #f8fafc)`,
                  overflow: 'hidden',
                }}
              >
                {cover ? (
                  <Box
                    component="img"
                    src={assetUrl(cover) || undefined}
                    alt=""
                    referrerPolicy="no-referrer"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                      opacity: 0.92,
                    }}
                  />
                ) : null}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, transparent 40%, ${colors.bg}cc)`,
                  }}
                />
                <Box sx={{ position: 'absolute', top: 8, insetInlineStart: 8 }}>
                  <SupermarketAvatar store={leaflet.supermarket} size="sm" />
                </Box>
                {cardFresh ? (
                  <Chip
                    size="small"
                    label={cardFresh.label}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      insetInlineEnd: 8,
                      height: 22,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      bgcolor:
                        cardFresh.tone === 'error'
                          ? '#B91C1C'
                          : cardFresh.tone === 'warning'
                            ? '#D97706'
                            : '#15803D',
                      color: '#fff',
                    }}
                  />
                ) : null}
              </Box>
              <Box sx={{ p: 1.25 }}>
                <Typography fontWeight={800} fontSize="0.98rem" noWrap>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" noWrap>
                  {t('offers.offerCount', { count: leaflet.offers.length })}
                  {' · '}
                  {formatRange(leaflet.start_date, leaflet.end_date, locale)}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>

      {active ? (
        <Stack spacing={2.25} key={active.id} className="animate-soft-rise delay-1">
          <Box
            sx={{
              p: 2,
              borderRadius: 4,
              border: '1px solid',
              borderColor: accent.ring,
              background: accent.soft,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <SupermarketAvatar store={active.supermarket} size="md" />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" fontWeight={800} lineHeight={1.25}>
                  {locale === 'ar' ? active.title_ar : active.title_en}
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mt: 1 }}>
                  {freshness ? (
                    <Chip
                      size="small"
                      label={freshness.label}
                      sx={{
                        height: 28,
                        fontWeight: 800,
                        bgcolor:
                          freshness.tone === 'error'
                            ? '#B91C1C'
                            : freshness.tone === 'warning'
                              ? '#D97706'
                              : '#15803D',
                        color: '#fff',
                      }}
                    />
                  ) : null}
                  <Chip
                    size="small"
                    icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />}
                    label={formatRange(active.start_date, active.end_date, locale)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', height: 28 }}
                  />
                  <Chip
                    size="small"
                    icon={<PlaceOutlinedIcon sx={{ fontSize: 16 }} />}
                    label={active.city}
                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', height: 28 }}
                  />
                  <Chip
                    size="small"
                    label={offerCountLabel}
                    sx={{
                      height: 28,
                      bgcolor: accent.chip,
                      color: accent.fg ?? (accent.chip === '#F5C400' ? '#1A1A1A' : '#fff'),
                      fontWeight: 800,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <LeafletViewer
            pages={leafletPages}
            sourceUrl={active.source_url}
            storeName={supermarketShortName(active.supermarket, locale)}
            accentColor={accent.chip}
            getQuantity={getQuantity}
            onHotspotSelect={setSelectedHotspot}
          />

          {filteredFlyerProducts.length ? (
            <Stack spacing={1.25}>
              <Typography variant="h6" fontWeight={900}>
                {t('offers.addFromFlyer')}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {t('offers.addFromFlyerHint')}
              </Typography>
              <Stack
                direction="row"
                spacing={1.25}
                sx={{
                  overflowX: 'auto',
                  pb: 0.5,
                  mx: -0.5,
                  px: 0.5,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {filteredFlyerProducts.map((hotspot) => {
                  const name = locale === 'ar' ? hotspot.nameAr : hotspot.name;
                  const qty = getQuantity(hotspot.productId);
                  const img = storeProductImageUrl(
                    hotspot.productId,
                    active.supermarket.slug,
                    getCanonicalProduct(hotspot.productId)?.image_url,
                  );
                  return (
                    <ButtonBase
                      key={hotspot.id}
                      onClick={() => setSelectedHotspot(hotspot)}
                      sx={{
                        flex: '0 0 128px',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'rgba(26,26,26,0.1)',
                        bgcolor: '#fff',
                        p: 1,
                        textAlign: 'start',
                        display: 'block',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          height: 72,
                          borderRadius: 2,
                          bgcolor: 'rgba(15,23,42,0.04)',
                          mb: 1,
                          overflow: 'hidden',
                        }}
                      >
                        {img ? (
                          <Box
                            component="img"
                            src={assetUrl(img) || undefined}
                            alt=""
                            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
                          />
                        ) : null}
                        {qty > 0 ? (
                          <Chip
                            size="small"
                            label={`×${qty}`}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              insetInlineEnd: 4,
                              height: 20,
                              bgcolor: accent.chip,
                              color: accent.fg ?? '#fff',
                              fontWeight: 800,
                            }}
                          />
                        ) : null}
                      </Box>
                      <Typography fontWeight={800} fontSize="0.78rem" noWrap>
                        {name}
                      </Typography>
                      <Typography fontWeight={900} fontSize="0.85rem" color="primary.main">
                        {formatSar(hotspot.price, locale)}
                      </Typography>
                    </ButtonBase>
                  );
                })}
              </Stack>
            </Stack>
          ) : null}

          <Stack spacing={1.25}>
            <Typography variant="h6" fontWeight={900}>
              {t('offers.clickablePromos')}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {t('offers.clickablePromosHint')}
            </Typography>
            {filteredActiveOffers.length ? (
              <WeeklyPromoGrid
                offers={filteredActiveOffers}
                accentColor="#F5C400"
                getQuantity={getQuantity}
                onAdd={addPromoToBasket}
              />
            ) : (
              <Alert severity="info">{t('offers.noDealMatches')}</Alert>
            )}
          </Stack>

          <ProductQuickAdd
            hotspot={selectedHotspot}
            storeName={supermarketShortName(active.supermarket, locale)}
            open={Boolean(selectedHotspot)}
            onClose={() => setSelectedHotspot(null)}
            onAdd={confirmHotspotAdd}
          />
        </Stack>
      ) : null}
        </>
      )}

      <Snackbar
        open={Boolean(toastName)}
        autoHideDuration={2200}
        onClose={() => setToastName(null)}
        message={t('offers.addedWithPrice', { name: toastName ?? '' })}
      />

      {active && betterPrice ? (
        <BetterPriceSnackbar
          open={Boolean(betterPrice)}
          productName={betterPrice.productName}
          currentStoreNameEn={active.supermarket.name_en}
          currentStoreNameAr={active.supermarket.name_ar}
          currentStoreSlug={active.supermarket.slug}
          currentPrice={betterPrice.currentPrice}
          bestStoreSlug={betterPrice.best.supermarketSlug}
          bestStoreNameEn={betterPrice.best.supermarketNameEn}
          bestStoreNameAr={betterPrice.best.supermarketNameAr}
          bestPrice={betterPrice.best.price}
          savings={betterPrice.savings}
          locale={locale}
          onClose={() => setBetterPrice(null)}
        />
      ) : null}
    </Stack>
  );
}
