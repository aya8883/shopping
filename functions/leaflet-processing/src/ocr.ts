/**
 * OCR provider abstraction — Mock for local; swap OCR_PROVIDER for cloud later.
 */

export interface OfferBlock {
  rawText: string;
  productName?: string;
  brand?: string;
  size?: string;
  unit?: string;
  regularPrice?: number;
  offerPrice?: number;
  promotion?: string;
}

export interface OCRProvider {
  extractText(input: { fileUrl: string }): Promise<string>;
  extractOfferBlocks(input: { fileUrl: string }): Promise<OfferBlock[]>;
  extractOfferBlocksForStore(storeSlug: string): Promise<OfferBlock[]>;
  extractProductInformation(input: { text: string }): Promise<OfferBlock[]>;
}

const CARREFOUR_BLOCKS: OfferBlock[] = [
  {
    rawText: 'Almarai Full Fat Milk 2L 9.95',
    productName: 'Almarai Full Fat Milk',
    brand: 'Almarai',
    size: '2',
    unit: 'L',
    regularPrice: 12.95,
    offerPrice: 9.95,
    promotion: 'Weekly leaflet special',
  },
  {
    rawText: 'Afia Sunflower Oil 1.5L 27.95',
    productName: 'Afia Sunflower Oil',
    brand: 'Afia',
    size: '1.5',
    unit: 'L',
    regularPrice: 29.95,
    offerPrice: 27.95,
    promotion: 'Pantry deal',
  },
  {
    rawText: 'Basmati Rice 10kg 34.95',
    productName: 'Basmati Rice',
    brand: 'Al Shalan',
    size: '10',
    unit: 'kg',
    regularPrice: 39.95,
    offerPrice: 34.95,
    promotion: 'Weekly offer',
  },
  {
    rawText: 'Tide Automatic 5kg 41.50',
    productName: 'Tide Automatic',
    brand: 'Tide',
    size: '5',
    unit: 'kg',
    regularPrice: 48,
    offerPrice: 41.5,
    promotion: 'Cleaning',
  },
  {
    rawText: 'Signal Toothpaste 100g 8.75',
    productName: 'Signal Toothpaste',
    brand: 'Signal',
    size: '100',
    unit: 'g',
    regularPrice: 10.95,
    offerPrice: 8.75,
    promotion: 'Care',
  },
];

const LULU_BLOCKS: OfferBlock[] = [
  {
    rawText: 'Almarai Full Fat Milk 2L 10.50',
    productName: 'Almarai Full Fat Milk',
    brand: 'Almarai',
    size: '2',
    unit: 'L',
    regularPrice: 12.5,
    offerPrice: 10.5,
    promotion: 'Weekly leaflet special',
  },
  {
    rawText: 'Noor Sunflower Oil 1.5L 23.50',
    productName: 'Noor Sunflower Oil',
    brand: 'Noor',
    size: '1.5',
    unit: 'L',
    regularPrice: 27.95,
    offerPrice: 23.5,
    promotion: 'Price drop',
  },
  {
    rawText: 'Basmati Rice 10kg 36.50',
    productName: 'Basmati Rice',
    brand: 'Al Shalan',
    size: '10',
    unit: 'kg',
    regularPrice: 41,
    offerPrice: 36.5,
    promotion: 'Weekly offer',
  },
  {
    rawText: 'Signal Toothpaste 100g 9.25',
    productName: 'Signal Toothpaste',
    brand: 'Signal',
    size: '100',
    unit: 'g',
    regularPrice: 10.95,
    offerPrice: 9.25,
    promotion: 'Care deals',
  },
  {
    rawText: 'Fresh Eggs 30 21.50',
    productName: 'Fresh Eggs',
    brand: 'Generic',
    size: '30',
    unit: 'piece',
    regularPrice: 24.95,
    offerPrice: 21.5,
    promotion: 'Fresh',
  },
];

const STORE_BLOCKS: Record<string, OfferBlock[]> = {
  carrefour: CARREFOUR_BLOCKS,
  lulu: LULU_BLOCKS,
  panda: CARREFOUR_BLOCKS,
  danube: LULU_BLOCKS,
  tamimi: CARREFOUR_BLOCKS,
  othaim: LULU_BLOCKS,
};

export class MockOCRProvider implements OCRProvider {
  async extractText(): Promise<string> {
    return 'Almarai Full Fat Milk 2L\n9.95 SAR\nCarrefour Weekly Offers';
  }

  async extractOfferBlocks(): Promise<OfferBlock[]> {
    return CARREFOUR_BLOCKS;
  }

  async extractOfferBlocksForStore(storeSlug: string): Promise<OfferBlock[]> {
    return STORE_BLOCKS[storeSlug] ?? CARREFOUR_BLOCKS;
  }

  async extractProductInformation(input: { text: string }): Promise<OfferBlock[]> {
    return [
      {
        rawText: input.text,
        productName: input.text.slice(0, 80),
      },
    ];
  }
}

export function createOCRProvider(provider = process.env.OCR_PROVIDER ?? 'mock'): OCRProvider {
  switch (provider) {
    case 'mock':
    default:
      return new MockOCRProvider();
  }
}
