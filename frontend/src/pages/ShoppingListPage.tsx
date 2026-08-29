import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export function ShoppingListPage() {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t('list.title')}
      </Typography>
      <Alert severity="info">{t('list.empty')}</Alert>
      <Alert severity="warning">{t('list.phaseNote')}</Alert>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" disabled>
          {t('list.compare')}
        </Button>
        <Button variant="outlined" disabled>
          {t('list.optimize')}
        </Button>
      </Stack>
    </Stack>
  );
}
