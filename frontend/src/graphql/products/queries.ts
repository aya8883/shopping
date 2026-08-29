import { gql } from '@apollo/client';

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String!, $limit: Int = 20) {
    products(
      where: {
        _and: [
          { active: { _eq: true } }
          {
            _or: [
              { name_en: { _ilike: $search } }
              { name_ar: { _ilike: $search } }
              { normalized_name: { _ilike: $search } }
              { barcode: { _eq: $search } }
              { brand: { name_en: { _ilike: $search } } }
              { brand: { name_ar: { _ilike: $search } } }
              { brand: { normalized_name: { _ilike: $search } } }
            ]
          }
        ]
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

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: uuid!) {
    products_by_pk(id: $id) {
      id
      name_en
      name_ar
      size_value
      size_unit
      package_description_en
      package_description_ar
      variant_en
      variant_ar
      image_url
      price_basis
      brand {
        id
        name_en
        name_ar
      }
      category {
        id
        name_en
        name_ar
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
        promotion_description_en
        promotion_description_ar
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

export const GET_CATEGORIES = gql`
  query GetCategories {
    product_categories(
      where: { active: { _eq: true }, parent_id: { _is_null: true } }
      order_by: { sort_order: asc }
    ) {
      id
      name_en
      name_ar
      slug
      icon
    }
  }
`;

export const GET_SUPERMARKETS = gql`
  query GetSupermarkets {
    supermarkets(where: { active: { _eq: true } }, order_by: { name_en: asc }) {
      id
      name_en
      name_ar
      slug
      logo_url
    }
  }
`;

export const GET_BEST_DEALS = gql`
  query GetBestDeals($limit: Int = 8) {
    supermarket_offers(
      where: { active: { _eq: true }, is_demo: { _eq: true } }
      order_by: { offer_price: asc }
      limit: $limit
    ) {
      id
      offer_price
      regular_price
      is_demo
      product {
        id
        name_en
        name_ar
        size_value
        size_unit
        brand {
          name_en
          name_ar
        }
      }
      supermarket {
        id
        name_en
        name_ar
        slug
      }
    }
  }
`;
