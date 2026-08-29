import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';

export function OffersPage() {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t('offers.title')}
      </Typography>
      <Alert severity="info">{t('offers.comingSoon')}</Alert>
    </Stack>
  );
}
