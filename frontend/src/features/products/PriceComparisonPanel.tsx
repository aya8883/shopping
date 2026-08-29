import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import {
  calculateUnitPrice,
  compareProductOffers,
  formatSar,
  type OfferLike,
} from '../../utils/pricing';
import { useAppContext } from '../../contexts/AppContext';

export function PriceComparisonPanel({
  offers,
  sizeValue,
  sizeUnit,
}: {
  offers: OfferLike[];
  sizeValue?: number | null;
  sizeUnit?: string | null;
}) {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const comparison = compareProductOffers(offers);

  if (!comparison.offers.length) {
    return (
      <Typography color="text.secondary">{t('product.noCurrentPrice')}</Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {comparison.best ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background:
              'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(21,128,61,0.10))',
            border: '1px solid rgba(15,118,110,0.18)',
          }}
        >
          <Typography variant="overline" color="primary.dark">
            {t('product.bestPrice')}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {locale === 'ar'
              ? comparison.best.supermarket?.name_ar
              : comparison.best.supermarket?.name_en}
          </Typography>
          <Typography variant="h4" color="primary.dark" fontWeight={700}>
            {formatSar(comparison.best.effective, locale)}
          </Typography>
          {comparison.saving > 0 ? (
            <Chip
              sx={{ mt: 1 }}
              color="success"
              label={`${t('product.youSave')}: ${formatSar(comparison.saving, locale)}`}
            />
          ) : null}
        </Paper>
      ) : null}

      <Stack spacing={1.5}>
        {comparison.offers.map((offer) => {
          const unit = calculateUnitPrice({
            price: offer.effective,
            sizeValue,
            sizeUnit,
          });
          const store =
            locale === 'ar' ? offer.supermarket?.name_ar : offer.supermarket?.name_en;

          return (
            <Paper key={offer.id} variant="outlined" sx={{ p: 2 }}>
              <Box className="flex items-start justify-between gap-3">
                <div>
                  <Typography fontWeight={700}>{store}</Typography>
                  {offer.regular_price ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('product.regular')}: {formatSar(Number(offer.regular_price), locale)}
                    </Typography>
                  ) : null}
                  {unit ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('product.unitPrice')}: {formatSar(unit.value, locale)}/{unit.unit}
                    </Typography>
                  ) : null}
                </div>
                <Typography variant="h6" fontWeight={700}>
                  {formatSar(offer.effective, locale)}
                </Typography>
              </Box>
              {offer.is_demo ? (
                <>
                  <Divider sx={{ my: 1.2 }} />
                  <Chip size="small" label={t('app.demoBadge')} />
                </>
              ) : null}
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
