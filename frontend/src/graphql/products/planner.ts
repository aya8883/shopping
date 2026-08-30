import { gql } from '@apollo/client';

export const GET_CATALOG_FOR_PLANNER = gql`
  query GetCatalogForPlanner($limit: Int = 100) {
    products(where: { active: { _eq: true } }, limit: $limit, order_by: { name_en: asc }) {
      id
      name_en
      name_ar
      size_value
      size_unit
      brand {
        name_en
        name_ar
      }
      category {
        name_en
        name_ar
        slug
      }
      offers(where: { active: { _eq: true } }, order_by: { offer_price: asc }) {
        id
        offer_price
        effective_price
        promotion_type
        minimum_quantity
        supermarket {
          id
          name_en
          name_ar
          slug
        }
      }
    }
  }
`;
