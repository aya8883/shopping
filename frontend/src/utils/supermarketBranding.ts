export type SupermarketLike = {
  id?: string;
  slug?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  logo_url?: string | null;
};

const FALLBACK_LOGOS: Record<string, string> = {
  carrefour: '/supermarkets/carrefour.svg',
  lulu: '/supermarkets/lulu.svg',
  panda: '/supermarkets/panda.svg',
  danube: '/supermarkets/danube.svg',
  tamimi: '/supermarkets/tamimi.svg',
  othaim: '/supermarkets/othaim.svg',
};

const SHORT_EN: Record<string, string> = {
  carrefour: 'Carrefour',
  lulu: 'LuLu',
  panda: 'Panda',
  danube: 'Danube',
  tamimi: 'Tamimi',
  othaim: 'Othaim',
};

const SHORT_AR: Record<string, string> = {
  carrefour: 'كارفور',
  lulu: 'لولو',
  panda: 'بنده',
  danube: 'الدانوب',
  tamimi: 'التميمي',
  othaim: 'العثيم',
};

const BRAND_COLORS: Record<string, { bg: string; fg: string }> = {
  carrefour: { bg: '#0B3D91', fg: '#FFFFFF' },
  lulu: { bg: '#0B7A3E', fg: '#F5C518' },
  panda: { bg: '#006B3F', fg: '#FFFFFF' },
  danube: { bg: '#C8102E', fg: '#FFFFFF' },
  tamimi: { bg: '#1B5E20', fg: '#FFD54F' },
  othaim: { bg: '#E65100', fg: '#FFFFFF' },
};

export function supermarketSlug(store?: SupermarketLike | null): string {
  return (store?.slug ?? '').toLowerCase().trim();
}

export function supermarketLogoUrl(store?: SupermarketLike | null): string | null {
  if (store?.logo_url) return store.logo_url;
  const slug = supermarketSlug(store);
  return FALLBACK_LOGOS[slug] ?? null;
}

export function supermarketShortName(
  store: SupermarketLike | null | undefined,
  locale: string,
): string {
  const slug = supermarketSlug(store);
  if (locale === 'ar') {
    return SHORT_AR[slug] ?? store?.name_ar ?? store?.name_en ?? '';
  }
  return SHORT_EN[slug] ?? store?.name_en ?? store?.name_ar ?? '';
}

export function supermarketBrandColors(store?: SupermarketLike | null): {
  bg: string;
  fg: string;
} {
  const slug = supermarketSlug(store);
  return BRAND_COLORS[slug] ?? { bg: '#0F766E', fg: '#FFFFFF' };
}
