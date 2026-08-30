import { gql } from '@apollo/client';

export const GET_PRODUCTS_FOR_BASKET = gql`
  query GetProductsForBasket($ids: [uuid!]!) {
    products(where: { id: { _in: $ids }, active: { _eq: true } }) {
      id
      name_en
      name_ar
      size_value
      size_unit
      brand {
        name_en
        name_ar
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
