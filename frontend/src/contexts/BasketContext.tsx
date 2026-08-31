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
  supermarket_name_en?: string | null;
  supermarket_name_ar?: string | null;
  /** Snapshot from weekly promotion when added. */
  offer_price?: number | null;
  regular_price?: number | null;
  description_en?: string | null;
  description_ar?: string | null;
  image_url?: string | null;
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
                ? {
                    ...x,
                    quantity: x.quantity + qty,
                    // Refresh promo snapshot when adding again from an offer
                    offer_price: item.offer_price ?? x.offer_price,
                    regular_price: item.regular_price ?? x.regular_price,
                    description_en: item.description_en ?? x.description_en,
                    description_ar: item.description_ar ?? x.description_ar,
                    image_url: item.image_url ?? x.image_url,
                    supermarket_name_en: item.supermarket_name_en ?? x.supermarket_name_en,
                    supermarket_name_ar: item.supermarket_name_ar ?? x.supermarket_name_ar,
                    addedFromSupermarketId:
                      item.addedFromSupermarketId ?? x.addedFromSupermarketId,
                  }
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
                supermarket_name_en: item.supermarket_name_en,
                supermarket_name_ar: item.supermarket_name_ar,
                offer_price: item.offer_price,
                regular_price: item.regular_price,
                description_en: item.description_en,
                description_ar: item.description_ar,
                image_url: item.image_url,
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
