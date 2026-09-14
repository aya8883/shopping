-- Stable upsert keys for weekly flyer ingest (named UNIQUE constraints so Hasura on_conflict works)
ALTER TABLE leaflets
  DROP CONSTRAINT IF EXISTS leaflets_store_window_key;
ALTER TABLE leaflets
  ADD CONSTRAINT leaflets_store_window_key UNIQUE (supermarket_id, start_date, end_date);

ALTER TABLE supermarket_offers
  DROP CONSTRAINT IF EXISTS supermarket_offers_product_store_window_key;
ALTER TABLE supermarket_offers
  ADD CONSTRAINT supermarket_offers_product_store_window_key UNIQUE (product_id, supermarket_id, start_date, end_date);

ALTER TABLE supermarkets
  ADD COLUMN IF NOT EXISTS promotions_url TEXT;
