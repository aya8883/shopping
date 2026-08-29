import { createTheme } from '@mui/material/styles';
import type { AppLocale } from '../config/app';

export function createAppTheme(locale: AppLocale) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return createTheme({
    direction,
    palette: {
      mode: 'light',
      primary: {
        main: '#0F766E',
        dark: '#0B5A54',
        light: '#14B8A6',
      },
      secondary: {
        main: '#C2410C',
      },
      success: {
        main: '#15803D',
      },
      background: {
        default: '#F3F7F5',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#134E4A',
        secondary: '#3F5F5B',
      },
    },
    typography: {
      fontFamily:
        locale === 'ar'
          ? '"IBM Plex Sans Arabic", "IBM Plex Sans", system-ui, sans-serif'
          : '"IBM Plex Sans", "IBM Plex Sans Arabic", system-ui, sans-serif',
      h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
      h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
      h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage:
              'radial-gradient(circle at 10% 0%, rgba(20,184,166,0.18), transparent 42%), radial-gradient(circle at 90% 10%, rgba(194,65,12,0.10), transparent 36%), linear-gradient(180deg, #F8FBFA 0%, #EEF5F2 100%)',
            minHeight: '100vh',
          },
        },
      },
    },
  });
}
