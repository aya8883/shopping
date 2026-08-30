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

const STORAGE_KEY = 'wain-awfar.selected-supermarket-ids';

interface AppContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  city: string;
  setCity: (city: string) => void;
  direction: 'rtl' | 'ltr';
  /** Empty array means “all stores” (no filter). */
  selectedSupermarketIds: string[];
  setSelectedSupermarketIds: (ids: string[]) => void;
  toggleSupermarket: (id: string) => void;
  isSupermarketSelected: (id: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function readStoredIds(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const initialLocale: AppLocale = i18n.language?.startsWith('ar')
    ? 'ar'
    : i18n.language?.startsWith('en')
      ? 'en'
      : appConfig.defaultLocale;
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [city, setCity] = useState(appConfig.defaultCity);
  const [selectedSupermarketIds, setSelectedSupermarketIdsState] = useState<string[]>(
    () => readStoredIds() ?? [],
  );

  const setLocale = useCallback(
    (next: AppLocale) => {
      setLocaleState(next);
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  const setSelectedSupermarketIds = useCallback((ids: string[]) => {
    const unique = [...new Set(ids)];
    setSelectedSupermarketIdsState(unique);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  }, []);

  const toggleSupermarket = useCallback((id: string) => {
    setSelectedSupermarketIdsState((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isSupermarketSelected = useCallback(
    (id: string) => selectedSupermarketIds.includes(id),
    [selectedSupermarketIds],
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
      selectedSupermarketIds,
      setSelectedSupermarketIds,
      toggleSupermarket,
      isSupermarketSelected,
    }),
    [
      locale,
      setLocale,
      city,
      selectedSupermarketIds,
      setSelectedSupermarketIds,
      toggleSupermarket,
      isSupermarketSelected,
    ],
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

/** Filter offers by the user's selected supermarket preference. */
export function filterOffersBySelectedStores<
  T extends { supermarket?: { id: string } | null },
>(offers: T[], selectedIds: string[]): T[] {
  if (selectedIds.length === 0) return [];
  return offers.filter((o) => !!o.supermarket?.id && selectedIds.includes(o.supermarket.id));
}
