import { createTheme } from '@mui/material/styles';
import type { AppLocale } from '../config/app';

/** Yellow-forward consumer theme matching the Wain Awfar home mock. */
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
        main: '#F5C400',
        dark: '#D4A800',
        light: '#FFE566',
        contrastText: '#1A1A1A',
      },
      secondary: {
        main: '#1F2937',
        dark: '#111827',
        light: '#4B5563',
      },
      success: {
        main: '#16A34A',
        dark: '#15803D',
      },
      error: {
        main: '#E11D48',
        dark: '#BE123C',
      },
      warning: {
        main: '#F59E0B',
      },
      background: {
        default: '#F4F5F7',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#6B7280',
      },
      divider: 'rgba(26, 26, 26, 0.08)',
    },
    typography: {
      fontFamily: fontSans,
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 800, letterSpacing: '-0.015em' },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 800 },
      subtitle1: { fontWeight: 700 },
      subtitle2: { fontWeight: 700, letterSpacing: '0.01em' },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.06em',
        fontSize: '0.7rem',
      },
      button: { textTransform: 'none', fontWeight: 800 },
    },
    shape: { borderRadius: 18 },
    shadows: [
      'none',
      '0 1px 2px rgba(15, 23, 42, 0.04)',
      '0 4px 14px rgba(15, 23, 42, 0.06)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 12px 32px rgba(15, 23, 42, 0.10)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
      '0 16px 40px rgba(15, 23, 42, 0.12)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#F4F5F7',
            backgroundImage: 'none',
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
            paddingBlock: 10,
          },
          containedPrimary: {
            backgroundImage: 'none',
            backgroundColor: '#F5C400',
            color: '#1A1A1A',
            boxShadow: '0 8px 20px rgba(245, 196, 0, 0.35)',
            '&:hover': {
              backgroundColor: '#E6B800',
              boxShadow: '0 10px 24px rgba(245, 196, 0, 0.4)',
            },
          },
          outlined: {
            borderWidth: 1.5,
            borderColor: 'rgba(26,26,26,0.14)',
            '&:hover': { borderWidth: 1.5, borderColor: '#F5C400' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 999,
          },
          filledPrimary: {
            backgroundColor: '#F5C400',
            color: '#1A1A1A',
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: 'rgba(26, 26, 26, 0.08)',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: '1px solid rgba(26, 26, 26, 0.06)',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 14px 28px rgba(15, 23, 42, 0.10)',
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
              borderRadius: 999,
              backgroundColor: '#F3F4F6',
              transition: 'box-shadow 180ms ease',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'rgba(26,26,26,0.08)' },
              '&.Mui-focused': {
                backgroundColor: '#fff',
                boxShadow: '0 0 0 3px rgba(245, 196, 0, 0.35)',
                '& fieldset': { borderColor: '#F5C400' },
              },
            },
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 56,
            color: '#9CA3AF',
            '&.Mui-selected': {
              color: '#1A1A1A',
            },
          },
          label: {
            fontSize: '0.68rem',
            fontWeight: 700,
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
          root: { borderRadius: 16 },
        },
      },
    },
  });
}
