import weeklyOffers from './weekly-offers.json';

type WeeklyOfferRow = {
  productId: string;
  offer_price: number;
  regular_price?: number | null;
  promotion_en?: string;
  promotion_ar?: string;
  source?: string;
};

type WeeklyStore = {
  start_date?: string;
  end_date?: string;
  offers?: WeeklyOfferRow[];
};

const stores = (weeklyOffers.stores ?? {}) as Record<string, WeeklyStore>;

/** Flyer-sourced offer for a product at a store, if present in weekly-offers.json. */
export function weeklyOfferFor(
  productId: string,
  storeSlug: string,
): WeeklyOfferRow | null {
  const list = stores[storeSlug]?.offers ?? [];
  return list.find((o) => o.productId === productId) ?? null;
}

export function weeklyOfferWindow(storeSlug: string): {
  start_date?: string;
  end_date?: string;
} {
  const store = stores[storeSlug];
  return {
    start_date: store?.start_date,
    end_date: store?.end_date,
  };
}

export const weeklyOffersSyncedAt = weeklyOffers.syncedAt as string;
export const weeklyOffersAttribution = weeklyOffers.attribution as string;
