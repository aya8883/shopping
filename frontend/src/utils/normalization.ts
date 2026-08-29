const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

const ALEF_FORMS = /[أإآٱ]/g;
const DIACRITICS = /[\u064B-\u065F\u0670]/g;
const TATWEEL = /\u0640/g;

const UNIT_MAP: Record<string, string> = {
  لتر: 'L',
  ليتر: 'L',
  l: 'L',
  liter: 'L',
  litre: 'L',
  مل: 'ml',
  ml: 'ml',
  milliliter: 'ml',
  جرام: 'g',
  غرام: 'g',
  g: 'g',
  gram: 'g',
  grams: 'g',
  كجم: 'kg',
  كيلو: 'kg',
  kg: 'kg',
  kilogram: 'kg',
  حبة: 'piece',
  قطعة: 'piece',
  piece: 'piece',
  عبوة: 'pack',
  علبة: 'pack',
  كرتون: 'carton',
  لفة: 'roll',
};

export function normalizeArabicDigits(input: string): string {
  return input
    .split('')
    .map((ch) => {
      const indic = ARABIC_INDIC_DIGITS.indexOf(ch);
      if (indic >= 0) return String(indic);
      const eastern = EASTERN_ARABIC_DIGITS.indexOf(ch);
      if (eastern >= 0) return String(eastern);
      return ch;
    })
    .join('');
}

export function normalizeArabicText(input: string): string {
  return normalizeArabicDigits(input)
    .replace(DIACRITICS, '')
    .replace(TATWEEL, '')
    .replace(ALEF_FORMS, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function normalizeEnglishText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeProductName(input: string): string {
  const mixed = normalizeArabicText(input);
  return normalizeEnglishText(mixed);
}

export function normalizeUnit(raw: string): string | null {
  const key = normalizeArabicText(raw).replace(/\s+/g, '');
  return UNIT_MAP[key] ?? UNIT_MAP[raw.toLowerCase().trim()] ?? null;
}

export interface ParsedSize {
  sizeValue: number;
  sizeUnit: string;
}

export function parseSizeAndUnit(input: string): ParsedSize | null {
  const text = normalizeArabicDigits(input).trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z\u0600-\u06FF]+)/);
  if (!match) return null;
  const sizeValue = Number(match[1]);
  const sizeUnit = normalizeUnit(match[2]);
  if (!sizeUnit || Number.isNaN(sizeValue)) return null;
  return { sizeValue, sizeUnit };
}
