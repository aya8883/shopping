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
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { GET_CURRENT_LEAFLETS } from '../graphql/leaflets/queries';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { SupermarketAvatar } from '../components/SupermarketMark';
import { LeafletViewer, type LeafletPage } from '../components/LeafletViewer';
import { WeeklyPromoGrid, type PromoOffer } from '../components/WeeklyPromoGrid';
import { ProductQuickAdd } from '../components/ProductQuickAdd';
import { BetterPriceSnackbar } from '../components/BetterPriceSnackbar';
import type { LeafletOfferHotspot } from '../data/leafletHotspots';
import { storeProductImageUrl } from '../data/storeProductImages';
import { getCanonicalProduct, getLeafletHotspots, savingsVsStore } from '../data/leafletHotspots';
import {
  supermarketBrandColors,
  supermarketShortName,
} from '../utils/supermarketBranding';

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
  if (slug === 'carrefour') {
    return {
      soft: 'linear-gradient(145deg, rgba(11,61,145,0.12), rgba(227,6,19,0.08) 55%, rgba(255,255,255,0.9))',
      ring: 'rgba(11,61,145,0.35)',
      chip: '#0B3D91',
    };
  }
  if (slug === 'lulu') {
    return {
      soft: 'linear-gradient(145deg, rgba(11,122,62,0.14), rgba(245,197,24,0.18) 55%, rgba(255,255,255,0.9))',
      ring: 'rgba(11,122,62,0.35)',
      chip: '#0B7A3E',
    };
  }
  if (slug === 'panda') {
    return {
      soft: 'linear-gradient(145deg, rgba(0,107,63,0.14), rgba(255,255,255,0.92) 60%)',
      ring: 'rgba(0,107,63,0.35)',
      chip: '#006B3F',
    };
  }
  return {
    soft: 'linear-gradient(145deg, rgba(245,196,0,0.18), rgba(255,255,255,0.95))',
    ring: 'rgba(245,196,0,0.45)',
    chip: '#F5C400',
  };
}

export function OffersPage() {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const { addItem, getQuantity } = useBasket();
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

  const leaflets: Leaflet[] = data?.leaflets ?? [];
  const active = leaflets[tab] ?? leaflets[0];
  const accent = storeAccent(active?.supermarket.slug);

  const offerCountLabel = useMemo(() => {
    if (!active) return '';
    return t('offers.offerCount', { count: active.offers.length });
  }, [active, t]);

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

      <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
        {leaflets.map((leaflet, index) => {
          const selected = index === tab;
          const colors = supermarketBrandColors(leaflet.supermarket);
          const name = supermarketShortName(leaflet.supermarket, locale);
          return (
            <ButtonBase
              key={leaflet.id}
              onClick={() => setTab(index)}
              aria-pressed={selected}
              sx={{
                flex: '1 1 140px',
                maxWidth: '100%',
                borderRadius: 3,
                p: 1.25,
                overflow: 'hidden',
                textAlign: 'start',
                border: '2px solid',
                borderColor: selected ? colors.bg : 'rgba(26,26,26,0.08)',
                background: selected
                  ? `linear-gradient(145deg, ${colors.bg}18, #fff 70%)`
                  : '#fff',
                boxShadow: selected
                  ? `0 12px 28px ${colors.bg}33`
                  : '0 6px 18px rgba(15,23,42,0.05)',
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                <SupermarketAvatar store={leaflet.supermarket} size="md" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight={800} fontSize="0.98rem" noWrap>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap>
                    {t('offers.offerCount', { count: leaflet.offers.length })}
                  </Typography>
                </Box>
              </Stack>
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
                      color: accent.chip === '#F5C400' ? '#1A1A1A' : '#fff',
                      fontWeight: 800,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={1.25}>
            <Typography variant="h6" fontWeight={900}>
              {t('offers.clickablePromos')}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {t('offers.clickablePromosHint')}
            </Typography>
            <WeeklyPromoGrid
              offers={active.offers}
              accentColor="#F5C400"
              getQuantity={getQuantity}
              onAdd={addPromoToBasket}
            />
          </Stack>

          <LeafletViewer
            pages={leafletPages}
            sourceUrl={active.source_url}
            storeName={supermarketShortName(active.supermarket, locale)}
            accentColor={accent.chip}
            getQuantity={getQuantity}
            onHotspotSelect={setSelectedHotspot}
          />

          <ProductQuickAdd
            hotspot={selectedHotspot}
            storeName={supermarketShortName(active.supermarket, locale)}
            open={Boolean(selectedHotspot)}
            onClose={() => setSelectedHotspot(null)}
            onAdd={confirmHotspotAdd}
          />
        </Stack>
      ) : null}

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
