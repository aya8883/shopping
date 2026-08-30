import { gql } from '@apollo/client';

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: uuid!, $limit: Int = 40) {
    products(
      where: {
        _and: [{ active: { _eq: true } }, { category_id: { _eq: $categoryId } }]
      }
      limit: $limit
      order_by: { name_en: asc }
    ) {
      id
      name_en
      name_ar
      size_value
      size_unit
      package_description_en
      package_description_ar
      image_url
      brand {
        id
        name_en
        name_ar
      }
      category {
        id
        name_en
        name_ar
        slug
      }
      offers(where: { active: { _eq: true } }, order_by: { offer_price: asc }) {
        id
        offer_price
        regular_price
        effective_price
        display_price
        unit_price
        unit_price_unit
        promotion_type
        minimum_quantity
        currency
        city
        is_demo
        start_date
        end_date
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
