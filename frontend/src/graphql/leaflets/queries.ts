import { gql } from '@apollo/client';

export const GET_CURRENT_LEAFLETS = gql`
  query GetCurrentLeaflets($today: date!) {
    leaflets(
      where: {
        _and: [
          { status: { _eq: "published" } }
          { start_date: { _lte: $today } }
          { end_date: { _gte: $today } }
        ]
      }
      order_by: { supermarket: { name_en: asc } }
    ) {
      id
      title_en
      title_ar
      start_date
      end_date
      city
      status
      supermarket {
        id
        name_en
        name_ar
        slug
      }
      offers(
        where: { active: { _eq: true } }
        order_by: { offer_price: asc }
      ) {
        id
        offer_price
        regular_price
        effective_price
        currency
        is_demo
        promotion_description_en
        promotion_description_ar
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
      }
    }
  }
`;
