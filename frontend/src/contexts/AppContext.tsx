import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { appConfig, type AppLocale } from '../config/app';

interface AppContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  city: string;
  setCity: (city: string) => void;
  direction: 'rtl' | 'ltr';
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const initialLocale: AppLocale = i18n.language?.startsWith('ar')
    ? 'ar'
    : i18n.language?.startsWith('en')
      ? 'en'
      : appConfig.defaultLocale;
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [city, setCity] = useState(appConfig.defaultCity);

  const setLocale = useCallback(
    (next: AppLocale) => {
      setLocaleState(next);
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      setLocale,
      city,
      setCity,
      direction: locale === 'ar' ? 'rtl' : 'ltr',
    }),
    [locale, setLocale, city],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
