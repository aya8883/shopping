import { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useTranslation } from 'react-i18next';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { useAppContext } from '../contexts/AppContext';
import { appConfig } from '../config/app';

export function ConsumerLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { city, locale } = useAppContext();
  const brand = locale === 'ar' ? appConfig.nameAr : appConfig.name;
  const [query, setQuery] = useState('');

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
            minHeight: 64,
            gap: 1.25,
            px: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
            py: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <LightbulbOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  lineHeight: 1.1,
                  color: 'text.primary',
                }}
              >
                {brand}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {locale === 'ar' ? appConfig.sloganAr : appConfig.slogan}
              </Typography>
            </Box>
          </Stack>

          <TextField
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder={t('home.searchPlaceholder')}
            sx={{
              flex: '1 1 180px',
              minWidth: 140,
              maxWidth: 420,
              mx: 'auto',
              '& .MuiOutlinedInput-root': {
                height: 42,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                height: 36,
                borderRadius: 999,
                bgcolor: '#F3F4F6',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <PlaceOutlinedIcon sx={{ fontSize: 18, color: 'primary.dark' }} />
              {city === 'Riyadh' ? t('app.city') : city}
            </Box>
            <IconButton
              component={RouterLink}
              to="/profile"
              size="small"
              aria-label={t('nav.profile')}
              sx={{ bgcolor: '#F3F4F6', width: 36, height: 36 }}
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
