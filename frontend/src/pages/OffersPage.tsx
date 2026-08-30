import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { GET_CURRENT_LEAFLETS } from '../graphql/leaflets/queries';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { formatSar } from '../utils/pricing';

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
  supermarket: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
  };
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

  const offerCountLabel = useMemo(() => {
    if (!active) return '';
    return t('offers.offerCount', { count: active.offers.length });
  }, [active, t]);

  if (loading) {
    return (
      <Stack spacing={2} className="pb-4">
        <Skeleton variant="text" width={180} height={40} />
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={280} />
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
    <Stack spacing={2} className="pb-4">
      <div>
        <Typography variant="h5" fontWeight={700}>
          {t('offers.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('offers.weeklyThisWeek')}
        </Typography>
      </div>

      <Tabs
        value={Math.min(tab, leaflets.length - 1)}
        onChange={(_e, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {leaflets.map((leaflet) => (
          <Tab
            key={leaflet.id}
            label={locale === 'ar' ? leaflet.supermarket.name_ar : leaflet.supermarket.name_en}
          />
        ))}
      </Tabs>

      {active ? (
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid rgba(15,118,110,0.16)',
              background:
                'linear-gradient(135deg, rgba(15,118,110,0.10), rgba(194,65,12,0.06))',
            }}
          >
            <Typography variant="overline" color="primary.dark">
              {t('offers.weekly')}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {locale === 'ar' ? active.title_ar : active.title_en}
            </Typography>
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1 }}>
              <Chip
                size="small"
                label={formatRange(active.start_date, active.end_date, locale)}
              />
              <Chip size="small" variant="outlined" label={offerCountLabel} />
              <Chip size="small" variant="outlined" label={active.city} />
            </Stack>
          </Paper>

          {active.offers.length === 0 ? (
            <Alert severity="info">{t('offers.noOffers')}</Alert>
          ) : (
            <Paper variant="outlined">
              <List disablePadding>
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

                  return (
                    <Box key={offer.id}>
                      {index > 0 ? <Divider /> : null}
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label={t('product.addToList')}
                            color="primary"
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
                          >
                            <AddShoppingCartOutlinedIcon />
                          </IconButton>
                        }
                      >
                        <ListItemButton
                          component={RouterLink}
                          to={`/products/${offer.product.id}`}
                          alignItems="flex-start"
                          sx={{ pr: 7 }}
                        >
                          <ListItemText
                            primary={
                              <Box className="flex items-start justify-between gap-2">
                                <Typography fontWeight={700} lineHeight={1.3}>
                                  {name}
                                  {getQuantity(offer.product.id) > 0 ? (
                                    <Chip
                                      size="small"
                                      sx={{ ml: 1 }}
                                      label={`×${getQuantity(offer.product.id)}`}
                                    />
                                  ) : null}
                                </Typography>
                                <Typography
                                  fontWeight={700}
                                  color="primary.dark"
                                  whiteSpace="nowrap"
                                >
                                  {formatSar(Number(offer.offer_price), locale)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {[brand, size].filter(Boolean).join(' · ')}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {offer.regular_price ? (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ textDecoration: 'line-through' }}
                                    >
                                      {formatSar(Number(offer.regular_price), locale)}
                                    </Typography>
                                  ) : null}
                                  {discount ? (
                                    <Chip size="small" color="success" label={`${discount}%`} />
                                  ) : null}
                                  {promo ? (
                                    <Chip size="small" label={promo} variant="outlined" />
                                  ) : null}
                                  {offer.is_demo ? (
                                    <Chip
                                      size="small"
                                      color="warning"
                                      label={t('app.demoBadge')}
                                    />
                                  ) : null}
                                </Stack>
                              </Stack>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            </Paper>
          )}
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
