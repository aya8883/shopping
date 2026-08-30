import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'wain-awfar.basket-items';

export interface BasketItem {
  productId: string;
  quantity: number;
  name_en: string;
  name_ar: string;
  size_value?: number | null;
  size_unit?: string | null;
  brand_en?: string | null;
  brand_ar?: string | null;
  /** Store the customer was browsing when they added the item (optional). */
  addedFromSupermarketId?: string | null;
}

interface BasketContextValue {
  items: BasketItem[];
  itemCount: number;
  addItem: (item: Omit<BasketItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearBasket: () => void;
  getQuantity: (productId: string) => number;
}

const BasketContext = createContext<BasketContextValue | null>(null);

function readItems(): BasketItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is BasketItem =>
        !!x && typeof x === 'object' && typeof (x as BasketItem).productId === 'string',
    );
  } catch {
    return [];
  }
}

function persist(items: BasketItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>(readItems);

  const addItem = useCallback(
    (item: Omit<BasketItem, 'quantity'> & { quantity?: number }) => {
      setItems((prev) => {
        const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
        const existing = prev.find((x) => x.productId === item.productId);
        const next = existing
          ? prev.map((x) =>
              x.productId === item.productId
                ? { ...x, quantity: x.quantity + qty }
                : x,
            )
          : [
              ...prev,
              {
                productId: item.productId,
                quantity: qty,
                name_en: item.name_en,
                name_ar: item.name_ar,
                size_value: item.size_value,
                size_unit: item.size_unit,
                brand_en: item.brand_en,
                brand_ar: item.brand_ar,
                addedFromSupermarketId: item.addedFromSupermarketId,
              },
            ];
        persist(next);
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.productId !== productId);
      persist(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((x) => x.productId !== productId);
        persist(next);
        return next;
      }
      const next = prev.map((x) =>
        x.productId === productId ? { ...x, quantity } : x,
      );
      persist(next);
      return next;
    });
  }, []);

  const clearBasket = useCallback(() => {
    persist([]);
    setItems([]);
  }, []);

  const getQuantity = useCallback(
    (productId: string) => items.find((x) => x.productId === productId)?.quantity ?? 0,
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, x) => sum + x.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      addItem,
      removeItem,
      setQuantity,
      clearBasket,
      getQuantity,
    }),
    [items, itemCount, addItem, removeItem, setQuantity, clearBasket, getQuantity],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) {
    throw new Error('useBasket must be used within BasketProvider');
  }
  return ctx;
}
