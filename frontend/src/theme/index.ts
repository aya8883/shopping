import { createTheme } from '@mui/material/styles';
import type { AppLocale } from '../config/app';

export function createAppTheme(locale: AppLocale) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const fontSans =
    locale === 'ar'
      ? '"IBM Plex Sans Arabic", "IBM Plex Sans", system-ui, sans-serif'
      : '"IBM Plex Sans", "IBM Plex Sans Arabic", system-ui, sans-serif';

  return createTheme({
    direction,
    palette: {
      mode: 'light',
      primary: {
        main: '#0D9488',
        dark: '#0F766E',
        light: '#2DD4BF',
        contrastText: '#F0FDFA',
      },
      secondary: {
        main: '#EA580C',
        dark: '#C2410C',
        light: '#FB923C',
      },
      success: {
        main: '#16A34A',
        dark: '#15803D',
      },
      warning: {
        main: '#D97706',
      },
      background: {
        default: '#F4F7F6',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#0F3D3A',
        secondary: '#4A6B67',
      },
      divider: 'rgba(15, 118, 110, 0.12)',
    },
    typography: {
      fontFamily: fontSans,
      h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 650, letterSpacing: '-0.015em' },
      h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 650 },
      h5: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 700, letterSpacing: '0.01em' },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.08em',
        fontSize: '0.7rem',
      },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 16 },
    shadows: [
      'none',
      '0 1px 2px rgba(15, 61, 58, 0.04)',
      '0 4px 14px rgba(15, 61, 58, 0.06)',
      '0 8px 24px rgba(15, 61, 58, 0.08)',
      '0 12px 32px rgba(15, 61, 58, 0.10)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
      '0 16px 40px rgba(15, 61, 58, 0.12)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#F3F8F6',
            backgroundImage: `
              radial-gradient(ellipse 90% 55% at -5% -5%, rgba(45, 212, 191, 0.28), transparent 55%),
              radial-gradient(ellipse 70% 45% at 105% 0%, rgba(234, 88, 12, 0.16), transparent 52%),
              radial-gradient(ellipse 50% 35% at 50% 100%, rgba(22, 163, 74, 0.08), transparent 60%),
              linear-gradient(180deg, #F8FCFA 0%, #EEF5F2 48%, #F3F8F6 100%)
            `,
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 18,
            paddingBlock: 10,
          },
          containedPrimary: {
            backgroundImage: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            boxShadow: '0 8px 20px rgba(13, 148, 136, 0.28)',
            '&:hover': {
              backgroundImage: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
              boxShadow: '0 10px 24px rgba(13, 148, 136, 0.34)',
            },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': { borderWidth: 1.5 },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 999,
          },
          filledPrimary: {
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.22)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: 'rgba(15, 118, 110, 0.12)',
            boxShadow: '0 4px 18px rgba(15, 61, 58, 0.04)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: '1px solid rgba(15, 118, 110, 0.10)',
            boxShadow: '0 6px 20px rgba(15, 61, 58, 0.05)',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px rgba(15, 61, 58, 0.10)',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(8px)',
              transition: 'box-shadow 180ms ease',
              '&.Mui-focused': {
                boxShadow: '0 0 0 4px rgba(13, 148, 136, 0.12)',
              },
            },
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 64,
            '&.Mui-selected': {
              color: '#0F766E',
            },
          },
          label: {
            fontSize: '0.68rem',
            fontWeight: 600,
            '&.Mui-selected': { fontSize: '0.7rem' },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            minHeight: 44,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 14 },
        },
      },
    },
  });
}
