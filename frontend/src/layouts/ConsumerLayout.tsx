import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useTranslation } from 'react-i18next';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { useAppContext } from '../contexts/AppContext';
import { appConfig } from '../config/app';

export function ConsumerLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { city, locale } = useAppContext();
  const brand = locale === 'ar' ? appConfig.nameAr : appConfig.name;
  const hideChromeSearch = location.pathname === '/' || location.pathname.startsWith('/search');

  return (
    <Box className="min-h-screen pb-28" sx={{ bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(26,26,26,0.06)',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Toolbar
          className="mx-auto w-full max-w-app md:max-w-desktop"
          sx={{
            minHeight: 56,
            gap: 1,
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                flexShrink: 0,
              }}
            >
              <LightbulbOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '1.05rem',
                lineHeight: 1.1,
                color: 'text.primary',
              }}
              noWrap
            >
              {brand}
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            {!hideChromeSearch ? (
              <Box
                onClick={() => navigate('/search')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/search');
                }}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  height: 34,
                  borderRadius: 999,
                  bgcolor: '#F3F4F6',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  color: 'text.secondary',
                }}
              >
                {t('home.searchPlaceholder')}
              </Box>
            ) : null}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                px: 1.1,
                height: 34,
                borderRadius: 999,
                bgcolor: '#F3F4F6',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'primary.dark' }} />
              {city === 'Riyadh' ? t('app.city') : city}
            </Box>
            <IconButton
              component={RouterLink}
              to="/profile"
              size="small"
              aria-label={t('nav.profile')}
              sx={{ bgcolor: '#F3F4F6', width: 34, height: 34 }}
            >
              <PersonOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <main className="mx-auto w-full max-w-app md:max-w-desktop px-4 pt-3 animate-fade-in">
        <Outlet />
      </main>

      <MobileBottomNavigation />
    </Box>
  );
}
