import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { compareProductOffers, formatSar } from '../../utils/pricing';
import { filterOffersBySelectedStores, useAppContext } from '../../contexts/AppContext';

export interface ProductCardProduct {
  id: string;
  name_en: string;
  name_ar: string;
  size_value?: number | null;
  size_unit?: string | null;
  brand?: { name_en: string; name_ar: string } | null;
  offers?: Array<{
    id: string;
    offer_price: number;
    regular_price?: number | null;
    effective_price?: number | null;
    is_demo?: boolean | null;
    supermarket?: { id: string; name_en: string; name_ar: string; slug: string } | null;
  }>;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const brand =
    locale === 'ar' ? product.brand?.name_ar : product.brand?.name_en;
  const comparison = compareProductOffers(
    filterOffersBySelectedStores(product.offers ?? [], selectedSupermarketIds),
  );
  const best = comparison.best;
  const supermarketName =
    locale === 'ar' ? best?.supermarket?.name_ar : best?.supermarket?.name_en;

  const discount =
    best?.regular_price && Number(best.regular_price) > best.effective
      ? Math.round(((Number(best.regular_price) - best.effective) / Number(best.regular_price)) * 100)
      : null;

  return (
    <Card variant="outlined" sx={{ borderColor: 'rgba(15,118,110,0.12)' }}>
      <CardActionArea component={RouterLink} to={`/products/${product.id}`}>
        <CardContent>
          <Stack spacing={1}>
            <Box className="flex items-start justify-between gap-2">
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                {name}
              </Typography>
              {best?.is_demo ? (
                <Chip size="small" label={t('app.demoBadge')} color="warning" variant="outlined" />
              ) : null}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {[brand, product.size_value && product.size_unit ? `${product.size_value}${product.size_unit}` : null]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
            {best ? (
              <Box className="flex items-end justify-between gap-2 pt-1">
                <div>
                  <Typography variant="h6" color="primary.dark" fontWeight={700}>
                    {formatSar(best.effective, locale)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {supermarketName}
                  </Typography>
                </div>
                {discount ? (
                  <Chip size="small" color="success" label={`${discount}%`} />
                ) : null}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('product.noCurrentPrice')}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
