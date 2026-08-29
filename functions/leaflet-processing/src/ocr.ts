/**
 * OCR provider abstraction — Phase 6 will wire real providers.
 * Development works without external API credentials via MockOCRProvider.
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
  extractProductInformation(input: { text: string }): Promise<OfferBlock[]>;
}

export class MockOCRProvider implements OCRProvider {
  async extractText(): Promise<string> {
    return 'Almarai Full Fat Milk 2L\n9.95 SAR\nCarrefour Weekly Offers';
  }

  async extractOfferBlocks(): Promise<OfferBlock[]> {
    return [
      {
        rawText: 'Almarai Full Fat Milk 2L 9.95',
        productName: 'Almarai Full Fat Milk',
        brand: 'Almarai',
        size: '2',
        unit: 'L',
        regularPrice: 12.95,
        offerPrice: 9.95,
        promotion: 'standard_discount',
      },
    ];
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
