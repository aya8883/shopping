ALTER TABLE leaflets DROP CONSTRAINT IF EXISTS leaflets_store_window_key;
ALTER TABLE supermarket_offers DROP CONSTRAINT IF EXISTS supermarket_offers_product_store_window_key;
ALTER TABLE supermarkets DROP COLUMN IF EXISTS promotions_url;
