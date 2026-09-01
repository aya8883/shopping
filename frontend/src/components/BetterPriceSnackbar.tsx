import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import { useTranslation } from 'react-i18next';
import { formatSar } from '../utils/pricing';
import { supermarketShortName } from '../utils/supermarketBranding';
import { SupermarketAvatar } from './SupermarketMark';

export function BetterPriceSnackbar({
  open,
  productName,
  currentStoreNameEn,
  currentStoreNameAr,
  currentStoreSlug,
  currentPrice,
  bestStoreSlug,
  bestStoreNameEn,
  bestStoreNameAr,
  bestPrice,
  savings,
  locale,
  onClose,
}: {
  open: boolean;
  productName: string;
  currentStoreNameEn: string;
  currentStoreNameAr: string;
  currentStoreSlug?: string;
  currentPrice: number;
  bestStoreSlug: string;
  bestStoreNameEn: string;
  bestStoreNameAr: string;
  bestPrice: number;
  savings: number;
  locale: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const bestName = supermarketShortName(
    { slug: bestStoreSlug, name_en: bestStoreNameEn, name_ar: bestStoreNameAr },
    locale,
  );
  const currentName = supermarketShortName(
    { name_en: currentStoreNameEn, name_ar: currentStoreNameAr },
    locale,
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="success" variant="filled" onClose={onClose} sx={{ width: '100%', maxWidth: 420 }}>
        <Typography fontWeight={800} fontSize="0.9rem">
          {t('offers.addedProduct', { name: productName })}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.95 }}>
          {t('offers.foundBetterPrice')}
        </Typography>
        <Stack spacing={0.75} sx={{ mt: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SupermarketAvatar
              store={{ slug: bestStoreSlug, name_en: bestStoreNameEn, name_ar: bestStoreNameAr }}
              size="sm"
            />
            <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
              {bestName} · {formatSar(bestPrice, locale)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SupermarketAvatar
              store={{
                slug: currentStoreSlug,
                name_en: currentStoreNameEn,
                name_ar: currentStoreNameAr,
              }}
              size="sm"
            />
            <Typography variant="body2" sx={{ opacity: 0.9, flex: 1 }}>
              {currentName} · {formatSar(currentPrice, locale)}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="body2" fontWeight={800} sx={{ mt: 0.75 }}>
          {t('offers.saveAmount', { amount: formatSar(savings, locale) })}
        </Typography>
      </Alert>
    </Snackbar>
  );
}
