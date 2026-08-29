import { describe, expect, it } from 'vitest';
import {
  normalizeArabicText,
  normalizeProductName,
  normalizeUnit,
  parseSizeAndUnit,
} from './normalization';

describe('Arabic normalization', () => {
  it('removes diacritics and normalizes alef', () => {
    expect(normalizeArabicText('ألْمَرَاعِي')).toContain('المراع');
  });

  it('maps Arabic digits', () => {
    expect(normalizeArabicText('٢ لتر')).toContain('2');
  });
});

describe('unit normalization', () => {
  it('maps liter variants to L', () => {
    expect(normalizeUnit('لتر')).toBe('L');
    expect(normalizeUnit('ليتر')).toBe('L');
    expect(normalizeUnit('Liter')).toBe('L');
  });
});

describe('parseSizeAndUnit', () => {
  it('parses 2L / ٢ لتر style sizes', () => {
    expect(parseSizeAndUnit('2L')).toEqual({ sizeValue: 2, sizeUnit: 'L' });
    expect(parseSizeAndUnit('٢ لتر')).toEqual({ sizeValue: 2, sizeUnit: 'L' });
    expect(parseSizeAndUnit('2 Liter')).toEqual({ sizeValue: 2, sizeUnit: 'L' });
  });
});

describe('normalizeProductName', () => {
  it('normalizes bilingual milk names toward comparable tokens', () => {
    const en = normalizeProductName('Almarai Full Fat Milk 2 Liter');
    const ar = normalizeProductName('حليب المراعي كامل الدسم ٢ لتر');
    expect(en).toContain('almarai');
    expect(ar).toContain('2');
  });
});
