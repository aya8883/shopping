import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import type { AppLocale } from '../config/app';

export function ProfilePage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useAppContext();

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t('profile.title')}
      </Typography>
      <Alert severity="info">{t('profile.anonymous')}</Alert>

      <Typography variant="subtitle2">{t('profile.language')}</Typography>
      <ToggleButtonGroup
        exclusive
        color="primary"
        value={locale}
        onChange={(_e, value: AppLocale | null) => {
          if (value) setLocale(value);
        }}
      >
        <ToggleButton value="ar">العربية</ToggleButton>
        <ToggleButton value="en">English</ToggleButton>
      </ToggleButtonGroup>

      <Button component={RouterLink} to="/auth" variant="contained" size="large">
        {t('profile.signIn')}
      </Button>
    </Stack>
  );
}
