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
const MAX_STORES_KEY = 'wain-awfar.max-store-count';

interface AppContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  city: string;
  setCity: (city: string) => void;
  direction: 'rtl' | 'ltr';
  selectedSupermarketIds: string[];
  setSelectedSupermarketIds: (ids: string[]) => void;
  toggleSupermarket: (id: string) => void;
  isSupermarketSelected: (id: string) => boolean;
  /** null = no limit (all selected stores allowed). */
  maxStoreCount: number | null;
  setMaxStoreCount: (count: number | null) => void;
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

function readMaxStoreCount(): number | null {
  try {
    const raw = localStorage.getItem(MAX_STORES_KEY);
    if (raw === null) return 2;
    if (raw === 'all' || raw === '0') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 2;
  } catch {
    return 2;
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
  const [maxStoreCount, setMaxStoreCountState] = useState<number | null>(readMaxStoreCount);

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

  const setMaxStoreCount = useCallback((count: number | null) => {
    setMaxStoreCountState(count);
    localStorage.setItem(MAX_STORES_KEY, count == null ? 'all' : String(count));
  }, []);

  const toggleSupermarket = useCallback(
    (id: string) => {
      setSelectedSupermarketIdsState((prev) => {
        let next: string[];
        if (prev.includes(id)) {
          next = prev.filter((x) => x !== id);
        } else if (maxStoreCount && prev.length >= maxStoreCount) {
          next = [...prev.slice(1), id];
        } else {
          next = [...prev, id];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [maxStoreCount],
  );

  const isSupermarketSelected = useCallback(
    (id: string) => selectedSupermarketIds.includes(id),
    [selectedSupermarketIds],
  );

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  useEffect(() => {
    if (!maxStoreCount) return;
    if (selectedSupermarketIds.length > maxStoreCount) {
      const trimmed = selectedSupermarketIds.slice(0, maxStoreCount);
      setSelectedSupermarketIdsState(trimmed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }, [maxStoreCount, selectedSupermarketIds]);

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
      maxStoreCount,
      setMaxStoreCount,
    }),
    [
      locale,
      setLocale,
      city,
      selectedSupermarketIds,
      setSelectedSupermarketIds,
      toggleSupermarket,
      isSupermarketSelected,
      maxStoreCount,
      setMaxStoreCount,
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
