import { describe, expect, it } from 'vitest';
import {
  buildIngestDraft,
  computeFreshness,
  draftToPublishedLeaflet,
  matchOfferBlocks,
  mockExtractOfferBlocks,
} from './leafletPipeline';

const catalog = [
  {
    id: '1',
    name_en: 'Almarai Full Fat Milk',
    name_ar: 'حليب',
    size_value: 2,
    size_unit: 'L',
    brand: { name_en: 'Almarai', name_ar: 'المراعي' },
  },
  {
    id: '2',
    name_en: 'Afia Sunflower Oil',
    name_ar: 'زيت',
    size_value: 1.5,
    size_unit: 'L',
    brand: { name_en: 'Afia', name_ar: 'عافية' },
  },
];

describe('leaflet pipeline', () => {
  it('extracts and matches carrefour leaflet blocks', () => {
    const blocks = mockExtractOfferBlocks('carrefour');
    const matches = matchOfferBlocks(blocks, catalog);
    expect(matches.some((m) => m.product?.id === '1')).toBe(true);
    expect(matches.some((m) => m.product?.id === '2')).toBe(true);
  });

  it('builds a publishable draft', () => {
    const draft = buildIngestDraft({
      supermarket: {
        id: 'c',
        name_en: 'Carrefour',
        name_ar: 'كارفور',
        slug: 'carrefour',
      },
      start_date: '2026-08-30',
      end_date: '2026-09-05',
      catalog,
    });
    const published = draftToPublishedLeaflet(draft);
    expect(published.status).toBe('published');
    expect(published.offers.length).toBeGreaterThan(0);
  });

  it('flags missing leaflets as stale', () => {
    const report = computeFreshness(
      [{ id: '1', slug: 'carrefour', name_en: 'Carrefour' }],
      [],
      '2026-08-31',
    );
    expect(report.stores[0].stale).toBe(true);
  });
});
