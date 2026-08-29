-- Phase 1–2 core schema for Wain Awfar (Riyadh supermarket price comparison)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supertokens_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  phone_number TEXT,
  first_name TEXT,
  last_name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
  country TEXT NOT NULL DEFAULT 'SA',
  city TEXT NOT NULL DEFAULT 'Riyadh',
  role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'reviewer', 'admin')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Supermarkets
-- ---------------------------------------------------------------------------
CREATE TABLE supermarkets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  country TEXT NOT NULL DEFAULT 'SA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_supermarkets_updated_at
  BEFORE UPDATE ON supermarkets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE supermarket_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'SA',
  city TEXT NOT NULL DEFAULT 'Riyadh',
  district TEXT,
  address TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supermarket_branches_supermarket_id ON supermarket_branches(supermarket_id);
CREATE INDEX idx_supermarket_branches_city ON supermarket_branches(city);

CREATE TRIGGER trg_supermarket_branches_updated_at
  BEFORE UPDATE ON supermarket_branches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Brands & categories
-- ---------------------------------------------------------------------------
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_normalized_name ON brands(normalized_name);
CREATE INDEX idx_brands_normalized_name_trgm ON brands USING gin (normalized_name gin_trgm_ops);

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  parent_id UUID REFERENCES product_categories(id),
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX idx_product_categories_sort_order ON product_categories(sort_order);

CREATE TRIGGER trg_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Canonical products
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES product_categories(id),
  subcategory_id UUID REFERENCES product_categories(id),
  barcode TEXT,
  variant_en TEXT,
  variant_ar TEXT,
  size_value NUMERIC(12, 3),
  size_unit TEXT,
  package_quantity NUMERIC(12, 3) DEFAULT 1,
  package_description_en TEXT,
  package_description_ar TEXT,
  product_type TEXT NOT NULL DEFAULT 'packaged'
    CHECK (product_type IN ('packaged', 'fresh', 'weighted', 'bundle')),
  price_basis TEXT NOT NULL DEFAULT 'package'
    CHECK (price_basis IN ('package', 'piece', 'kg', '100g', 'liter')),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_normalized_name ON products(normalized_name);
CREATE INDEX idx_products_normalized_name_trgm ON products USING gin (normalized_name gin_trgm_ops);
CREATE INDEX idx_products_name_en_trgm ON products USING gin (name_en gin_trgm_ops);
CREATE INDEX idx_products_name_ar_trgm ON products USING gin (name_ar gin_trgm_ops);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(active);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Leaflets (schema ready; processing in later phases)
-- ---------------------------------------------------------------------------
CREATE TABLE leaflets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'SA',
  city TEXT NOT NULL DEFAULT 'Riyadh',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('pdf', 'image', 'website', 'csv', 'manual', 'api')),
  source_url TEXT,
  original_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'processing', 'needs_review', 'approved', 'published', 'expired', 'failed')),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_date <= end_date)
);

CREATE INDEX idx_leaflets_supermarket_id ON leaflets(supermarket_id);
CREATE INDEX idx_leaflets_status ON leaflets(status);
CREATE INDEX idx_leaflets_city ON leaflets(city);
CREATE INDEX idx_leaflets_dates ON leaflets(start_date, end_date);

CREATE TRIGGER trg_leaflets_updated_at
  BEFORE UPDATE ON leaflets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE leaflet_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaflet_id UUID NOT NULL REFERENCES leaflets(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  image_url TEXT,
  ocr_text TEXT,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (leaflet_id, page_number)
);

CREATE TRIGGER trg_leaflet_pages_updated_at
  BEFORE UPDATE ON leaflet_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Offers
-- ---------------------------------------------------------------------------
CREATE TABLE supermarket_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
  branch_id UUID REFERENCES supermarket_branches(id),
  leaflet_id UUID REFERENCES leaflets(id),
  regular_price NUMERIC(10, 2),
  offer_price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  minimum_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  maximum_quantity NUMERIC(10, 2),
  promotion_type TEXT NOT NULL DEFAULT 'standard_discount'
    CHECK (promotion_type IN (
      'standard_discount', 'buy_one_get_one', 'buy_two_get_one', 'multi_buy',
      'percentage_discount', 'bundle', 'loyalty_offer', 'coupon', 'other'
    )),
  promotion_description_en TEXT,
  promotion_description_ar TEXT,
  requires_loyalty BOOLEAN NOT NULL DEFAULT FALSE,
  coupon_required BOOLEAN NOT NULL DEFAULT FALSE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_basis TEXT NOT NULL DEFAULT 'package',
  unit_price NUMERIC(10, 4),
  unit_price_unit TEXT,
  effective_price NUMERIC(10, 2),
  display_price NUMERIC(10, 2),
  country TEXT NOT NULL DEFAULT 'SA',
  city TEXT NOT NULL DEFAULT 'Riyadh',
  source_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_confidence NUMERIC(5, 2),
  validation_status TEXT NOT NULL DEFAULT 'valid'
    CHECK (validation_status IN ('valid', 'warning', 'invalid')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (offer_price > 0),
  CHECK (regular_price IS NULL OR regular_price > 0),
  CHECK (start_date <= end_date),
  CHECK (minimum_quantity >= 1)
);

CREATE INDEX idx_supermarket_offers_product_id ON supermarket_offers(product_id);
CREATE INDEX idx_supermarket_offers_supermarket_id ON supermarket_offers(supermarket_id);
CREATE INDEX idx_supermarket_offers_start_date ON supermarket_offers(start_date);
CREATE INDEX idx_supermarket_offers_end_date ON supermarket_offers(end_date);
CREATE INDEX idx_supermarket_offers_city ON supermarket_offers(city);
CREATE INDEX idx_supermarket_offers_active_dates ON supermarket_offers(active, start_date, end_date);
CREATE INDEX idx_supermarket_offers_leaflet_id ON supermarket_offers(leaflet_id);

CREATE TRIGGER trg_supermarket_offers_updated_at
  BEFORE UPDATE ON supermarket_offers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Matching / history / consumer data (schema for later phases)
-- ---------------------------------------------------------------------------
CREATE TABLE product_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_name_normalized TEXT NOT NULL,
  source_brand TEXT,
  source_size NUMERIC(12, 3),
  source_unit TEXT,
  source_package_quantity NUMERIC(12, 3),
  source_supermarket_id UUID REFERENCES supermarkets(id),
  canonical_product_id UUID REFERENCES products(id),
  confidence_score NUMERIC(5, 2),
  match_method TEXT
    CHECK (match_method IN ('barcode', 'exact', 'rules', 'fuzzy', 'ai', 'manual')),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_matches_source_name_normalized ON product_matches(source_name_normalized);
CREATE INDEX idx_product_matches_canonical_product_id ON product_matches(canonical_product_id);

CREATE TRIGGER trg_product_matches_updated_at
  BEFORE UPDATE ON product_matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
  branch_id UUID REFERENCES supermarket_branches(id),
  regular_price NUMERIC(10, 2),
  offer_price NUMERIC(10, 2),
  effective_price NUMERIC(10, 2),
  price_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source_offer_id UUID REFERENCES supermarket_offers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_product_date ON price_history(product_id, price_date);

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  supermarket_id UUID REFERENCES supermarkets(id),
  target_price NUMERIC(10, 2) NOT NULL CHECK (target_price > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_product_id ON price_alerts(product_id);

CREATE TRIGGER trg_price_alerts_updated_at
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);

CREATE TRIGGER trg_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shopping_list_id, product_id)
);

CREATE INDEX idx_shopping_list_items_shopping_list_id ON shopping_list_items(shopping_list_id);

CREATE TRIGGER trg_shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  type TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
