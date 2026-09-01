import raw from './leaflet-manifest.json';

export type LeafletManifestPage = {
  page_number: number;
  image_url: string;
};

export type LeafletManifestStore = {
  fullflyerUrl?: string;
  officialUrl?: string;
  title_en?: string;
  title_ar?: string;
  catalog_id?: string;
  start_date?: string;
  end_date?: string;
  pages?: LeafletManifestPage[];
  error?: string;
};

export type LeafletManifest = {
  syncedAt: string | null;
  attribution?: string;
  stores: Record<string, LeafletManifestStore>;
};

export const leafletManifest = raw as LeafletManifest;
