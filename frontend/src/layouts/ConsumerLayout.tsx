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
    <Box className="min-h-screen pb-28">
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(15, 118, 110, 0.08)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          backgroundColor: 'rgba(247, 251, 250, 0.78)',
        }}
      >
        <Toolbar className="mx-auto w-full max-w-app md:max-w-desktop gap-3" sx={{ minHeight: 64 }}>
          <Box className="grow" sx={{ minWidth: 0 }}>
            <Typography
              component={RouterLink}
              to="/"
              variant="h5"
              sx={{
                color: 'primary.dark',
                fontFamily: '"Fraunces", Georgia, serif',
                textDecoration: 'none',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1.15,
              }}
            >
              {brand}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.15, fontWeight: 500 }}
            >
              {locale === 'ar' ? appConfig.sloganAr : appConfig.slogan}
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={<PlaceOutlinedIcon />}
            label={city === 'Riyadh' ? t('app.city') : city}
            sx={{
              bgcolor: 'rgba(13, 148, 136, 0.08)',
              border: '1px solid rgba(13, 148, 136, 0.16)',
              fontWeight: 600,
            }}
          />
        </Toolbar>
      </AppBar>

      <main className="mx-auto w-full max-w-app md:max-w-desktop px-4 pt-3 animate-fade-in">
        <Outlet />
      </main>

      <MobileBottomNavigation />
    </Box>
  );
}
