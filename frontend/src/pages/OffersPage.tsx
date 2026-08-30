import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { GET_CURRENT_LEAFLETS } from '../graphql/leaflets/queries';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { formatSar } from '../utils/pricing';
import { SupermarketAvatar } from '../components/SupermarketMark';
import { LeafletViewer, type LeafletPage } from '../components/LeafletViewer';
import {
  supermarketBrandColors,
  supermarketShortName,
} from '../utils/supermarketBranding';

type LeafletOffer = {
  id: string;
  offer_price: number;
  regular_price?: number | null;
  is_demo?: boolean | null;
  promotion_description_en?: string | null;
  promotion_description_ar?: string | null;
  product: {
    id: string;
    name_en: string;
    name_ar: string;
    size_value?: number | null;
    size_unit?: string | null;
    brand?: { name_en: string; name_ar: string } | null;
  };
};

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
  offers: LeafletOffer[];
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
  return {
    soft: 'linear-gradient(145deg, rgba(13,148,136,0.14), rgba(234,88,12,0.10) 55%, rgba(255,255,255,0.9))',
    ring: 'rgba(13,148,136,0.35)',
    chip: '#0D9488',
  };
}

export function OffersPage() {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const { addItem, getQuantity } = useBasket();
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState(false);

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

  if (loading) {
    return (
      <Stack spacing={2} className="pb-4">
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>
          {t('offers.title')}
        </Typography>
        <Alert severity="error">{t('common.error')}</Alert>
      </Stack>
    );
  }

  if (!leaflets.length) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>
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
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3 },
          color: '#F0FDFA',
          background:
            'linear-gradient(135deg, #0F766E 0%, #0D9488 42%, #EA580C 120%)',
          boxShadow: '0 18px 40px rgba(15, 118, 110, 0.28)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            top: -60,
            right: -40,
            background: 'rgba(255,255,255,0.14)',
            filter: 'blur(2px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '50%',
            bottom: -40,
            left: 40,
            background: 'rgba(245,197,24,0.22)',
          }}
        />
        <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(255,255,255,0.18)',
              }}
            >
              <LocalOfferOutlinedIcon />
            </Box>
            <Typography variant="overline" sx={{ color: 'rgba(240,253,250,0.9)' }}>
              {t('offers.weekly')}
            </Typography>
          </Stack>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {t('offers.title')}
          </Typography>
          <Typography sx={{ color: 'rgba(240,253,250,0.88)', maxWidth: 420 }}>
            {t('offers.weeklyThisWeek')}
          </Typography>
        </Stack>
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
              className="animate-soft-rise delay-1"
              sx={{
                flex: '1 1 150px',
                borderRadius: 3,
                p: 1.5,
                textAlign: 'start',
                border: '2px solid',
                borderColor: selected ? colors.bg : 'rgba(15,118,110,0.10)',
                background: selected
                  ? `linear-gradient(145deg, ${colors.bg}18, #fff 70%)`
                  : 'rgba(255,255,255,0.88)',
                boxShadow: selected
                  ? `0 12px 28px ${colors.bg}33`
                  : '0 6px 18px rgba(15,61,58,0.05)',
                transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                transform: selected ? 'translateY(-2px)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: colors.bg,
                },
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: '100%' }}>
                <SupermarketAvatar store={leaflet.supermarket} size="md" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800} fontSize="1.05rem" noWrap>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('offers.offerCount', { count: leaflet.offers.length })}
                  </Typography>
                </Box>
              </Stack>
            </ButtonBase>
          );
        })}
      </Stack>

      {active ? (
        <Stack spacing={2.25} key={active.id} className="animate-soft-rise delay-2">
          <Box
            sx={{
              p: 2.25,
              borderRadius: 4,
              border: '1px solid',
              borderColor: accent.ring,
              background: accent.soft,
              boxShadow: '0 14px 32px rgba(15,61,58,0.07)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <SupermarketAvatar store={active.supermarket} size="lg" />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {locale === 'ar' ? active.title_ar : active.title_en}
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.25 }}>
                  <Chip
                    size="small"
                    icon={<CalendarMonthOutlinedIcon />}
                    label={formatRange(active.start_date, active.end_date, locale)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.85)', fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    icon={<PlaceOutlinedIcon />}
                    label={active.city}
                    sx={{ bgcolor: 'rgba(255,255,255,0.85)', fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    label={offerCountLabel}
                    sx={{
                      bgcolor: accent.chip,
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <LeafletViewer
            pages={active.pages ?? []}
            sourceUrl={active.source_url}
            storeName={supermarketShortName(active.supermarket, locale)}
            accentColor={accent.chip}
          />

          <Stack spacing={1.5}>
            <Typography
              variant="h6"
              sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 }}
            >
              {t('offers.pricedOffers')}
            </Typography>

            {active.offers.length === 0 ? (
              <Alert severity="info">{t('offers.noOffers')}</Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },
                  gap: 1.5,
                }}
              >
                {active.offers.map((offer, index) => {
                  const name =
                    locale === 'ar' ? offer.product.name_ar : offer.product.name_en;
                  const brand =
                    locale === 'ar'
                      ? offer.product.brand?.name_ar
                      : offer.product.brand?.name_en;
                  const size =
                    offer.product.size_value && offer.product.size_unit
                      ? `${offer.product.size_value}${offer.product.size_unit}`
                      : null;
                  const promo =
                    locale === 'ar'
                      ? offer.promotion_description_ar
                      : offer.promotion_description_en;
                  const discount =
                    offer.regular_price &&
                    Number(offer.regular_price) > Number(offer.offer_price)
                      ? Math.round(
                          ((Number(offer.regular_price) - Number(offer.offer_price)) /
                            Number(offer.regular_price)) *
                            100,
                        )
                      : null;
                  const qty = getQuantity(offer.product.id);
                  const delayClass = index % 3 === 0 ? '' : index % 3 === 1 ? 'delay-1' : 'delay-2';

                  return (
                    <Box
                      key={offer.id}
                      className={`animate-soft-rise ${delayClass}`}
                      sx={{
                        position: 'relative',
                        borderRadius: 3.5,
                        p: 2,
                        border: '1px solid rgba(15,118,110,0.12)',
                        background:
                          'linear-gradient(160deg, rgba(255,255,255,0.98), rgba(240,253,250,0.7) 55%, rgba(255,247,237,0.55))',
                        boxShadow: '0 10px 24px rgba(15,61,58,0.06)',
                        transition: 'transform 180ms ease, box-shadow 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 16px 32px rgba(15,61,58,0.12)',
                        },
                      }}
                    >
                      {discount ? (
                        <Chip
                          size="small"
                          color="success"
                          label={`-${discount}%`}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            insetInlineEnd: 12,
                            fontWeight: 800,
                          }}
                        />
                      ) : null}

                      <Stack
                        component={RouterLink}
                        to={`/products/${offer.product.id}`}
                        spacing={0.75}
                        sx={{ textDecoration: 'none', color: 'inherit', pr: 5 }}
                      >
                        <Typography fontWeight={800} lineHeight={1.3} fontSize="1.05rem">
                          {name}
                          {qty > 0 ? (
                            <Chip
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                              label={`×${qty}`}
                            />
                          ) : null}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {[brand, size].filter(Boolean).join(' · ')}
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ pt: 0.5 }}>
                          <Typography
                            sx={{
                              fontFamily: '"Fraunces", Georgia, serif',
                              fontWeight: 800,
                              fontSize: '1.55rem',
                              color: 'primary.dark',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {formatSar(Number(offer.offer_price), locale)}
                          </Typography>
                          {offer.regular_price ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {formatSar(Number(offer.regular_price), locale)}
                            </Typography>
                          ) : null}
                        </Stack>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {promo ? (
                            <Chip
                              size="small"
                              label={promo}
                              sx={{
                                bgcolor: 'rgba(234,88,12,0.10)',
                                color: 'secondary.dark',
                                fontWeight: 700,
                              }}
                            />
                          ) : null}
                          {offer.is_demo ? (
                            <Chip size="small" color="warning" label={t('app.demoBadge')} />
                          ) : null}
                        </Stack>
                      </Stack>

                      <IconButton
                        aria-label={t('product.addToList')}
                        onClick={() => {
                          addItem({
                            productId: offer.product.id,
                            name_en: offer.product.name_en,
                            name_ar: offer.product.name_ar,
                            size_value: offer.product.size_value,
                            size_unit: offer.product.size_unit,
                            brand_en: offer.product.brand?.name_en,
                            brand_ar: offer.product.brand?.name_ar,
                            addedFromSupermarketId: active.supermarket.id,
                          });
                          setToast(true);
                        }}
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          insetInlineEnd: 12,
                          bgcolor: 'primary.main',
                          color: '#fff',
                          boxShadow: '0 8px 18px rgba(13,148,136,0.35)',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        <AddShoppingCartOutlinedIcon />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Stack>
        </Stack>
      ) : null}

      <Snackbar
        open={toast}
        autoHideDuration={2000}
        onClose={() => setToast(false)}
        message={t('product.addedToList')}
      />
    </Stack>
  );
}
