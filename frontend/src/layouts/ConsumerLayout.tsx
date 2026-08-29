import { Outlet, Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useTranslation } from 'react-i18next';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { useAppContext } from '../contexts/AppContext';
import { appConfig } from '../config/app';

export function ConsumerLayout() {
  const { t } = useTranslation();
  const { city, locale } = useAppContext();
  const brand = locale === 'ar' ? appConfig.nameAr : appConfig.name;

  return (
    <Box className="min-h-screen pb-24">
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(243,247,245,0.85)' }}
      >
        <Toolbar className="mx-auto w-full max-w-app md:max-w-desktop gap-3">
          <Typography
            component={RouterLink}
            to="/"
            variant="h5"
            className="no-underline grow"
            sx={{ color: 'primary.dark', fontFamily: '"Fraunces", Georgia, serif', textDecoration: 'none' }}
          >
            {brand}
          </Typography>
          <Chip
            size="small"
            icon={<PlaceOutlinedIcon />}
            label={city === 'Riyadh' ? t('app.city') : city}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      <main className="mx-auto w-full max-w-app md:max-w-desktop px-4 pt-2">
        <Outlet />
      </main>

      <MobileBottomNavigation />
    </Box>
  );
}
