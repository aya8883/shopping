import { ApolloLink, Observable } from '@apollo/client';
import {
  getMockBestDeals,
  getMockCurrentLeaflets,
  mockCategories,
  mockProducts,
  mockSupermarkets,
  searchMockProducts,
} from './mockData';

function operationName(query: string | undefined): string {
  if (!query) return '';
  const match = query.match(/\b(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
  return match?.[1] ?? '';
}

function resolve(operation: string, variables: Record<string, unknown>) {
  switch (operation) {
    case 'GetCategories':
      return { product_categories: mockCategories };
    case 'GetSupermarkets':
      return { supermarkets: mockSupermarkets };
    case 'SearchProducts': {
      const search = String(variables.search ?? '%');
      const limit = Number(variables.limit ?? 20);
      return { products: searchMockProducts(search, limit) };
    }
    case 'GetProductById': {
      const id = String(variables.id ?? '');
      return { products_by_pk: mockProducts.find((p) => p.id === id) ?? null };
    }
    case 'GetBestDeals':
      return { supermarket_offers: getMockBestDeals(Number(variables.limit ?? 8)) };
    case 'GetCurrentLeaflets':
      return { leaflets: getMockCurrentLeaflets() };
    case 'GetProductsForBasket': {
      const ids = (variables.ids as string[]) ?? [];
      return {
        products: mockProducts
          .filter((p) => ids.includes(p.id))
          .map((p) => ({
            id: p.id,
            name_en: p.name_en,
            name_ar: p.name_ar,
            size_value: p.size_value,
            size_unit: p.size_unit,
            brand: p.brand,
            offers: p.offers.map((o) => ({
              id: o.id,
              offer_price: o.offer_price,
              effective_price: o.effective_price,
              promotion_type: o.promotion_type,
              minimum_quantity: o.minimum_quantity,
              supermarket: o.supermarket,
            })),
          })),
      };
    }
    default:
      console.warn(`[mock-graphql] Unhandled operation: ${operation}`);
      return {};
  }
}

/** Serves seeded demo data when Hasura is not available. */
export const mockLink = new ApolloLink((operation) => {
  const name = operation.operationName || operationName(operation.query.loc?.source.body);
  const data = resolve(name, operation.variables ?? {});

  return new Observable((observer) => {
    observer.next({ data });
    observer.complete();
  });
});
