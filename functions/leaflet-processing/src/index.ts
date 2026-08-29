import { createOCRProvider } from './ocr.js';

export function getProcessingStack() {
  return {
    ocr: createOCRProvider(),
  };
}

console.log('Leaflet processing stubs ready (Mock OCR).');
