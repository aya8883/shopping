-- Demo seed data for Phase 1–2 validation scenarios
-- Fixed UUIDs for reproducible local development

-- Supermarkets
INSERT INTO supermarkets (id, name_en, name_ar, slug, website_url, active, country) VALUES
  ('11111111-1111-1111-1111-111111111001', 'Carrefour Saudi Arabia', 'كارفور', 'carrefour', 'https://www.carrefourksa.com', TRUE, 'SA'),
  ('11111111-1111-1111-1111-111111111002', 'LuLu Hypermarket', 'لولو هايبرماركت', 'lulu', 'https://www.luluhypermarket.com', TRUE, 'SA')
ON CONFLICT (id) DO NOTHING;

-- Brands
INSERT INTO brands (id, name_en, name_ar, normalized_name, active) VALUES
  ('22222222-2222-2222-2222-222222222001', 'Almarai', 'المراعي', 'almarai', TRUE),
  ('22222222-2222-2222-2222-222222222002', 'Nadec', 'نادك', 'nadec', TRUE),
  ('22222222-2222-2222-2222-222222222003', 'Afia', 'عافية', 'afia', TRUE),
  ('22222222-2222-2222-2222-222222222004', 'Al Shalan', 'الشعلان', 'al shalan', TRUE),
  ('22222222-2222-2222-2222-222222222005', 'Abu Kass', 'أبو كاس', 'abu kass', TRUE),
  ('22222222-2222-2222-2222-222222222006', 'Tide', 'تايد', 'tide', TRUE),
  ('22222222-2222-2222-2222-222222222007', 'Persil', 'برسيل', 'persil', TRUE),
  ('22222222-2222-2222-2222-222222222008', 'Pepsi', 'بيبسي', 'pepsi', TRUE),
  ('22222222-2222-2222-2222-222222222009', 'Coca-Cola', 'كوكا كولا', 'coca cola', TRUE),
  ('22222222-2222-2222-2222-222222222010', 'Generic', 'عام', 'generic', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO product_categories (id, name_en, name_ar, slug, icon, sort_order, active) VALUES
  ('33333333-3333-3333-3333-333333333001', 'Dairy', 'ألبان', 'dairy', 'dairy', 1, TRUE),
  ('33333333-3333-3333-3333-333333333002', 'Meat & Poultry', 'لحوم ودواجن', 'meat-poultry', 'meat', 2, TRUE),
  ('33333333-3333-3333-3333-333333333003', 'Rice & Grains', 'أرز وحبوب', 'rice-grains', 'grains', 3, TRUE),
  ('33333333-3333-3333-3333-333333333004', 'Cooking Oil', 'زيوت الطبخ', 'cooking-oil', 'oil', 4, TRUE),
  ('33333333-3333-3333-3333-333333333005', 'Beverages', 'مشروبات', 'beverages', 'drink', 5, TRUE),
  ('33333333-3333-3333-3333-333333333006', 'Fruits & Vegetables', 'فواكه وخضروات', 'fruits-vegetables', 'produce', 6, TRUE),
  ('33333333-3333-3333-3333-333333333007', 'Cleaning', 'مواد تنظيف', 'cleaning', 'clean', 7, TRUE),
  ('33333333-3333-3333-3333-333333333008', 'Personal Care', 'العناية الشخصية', 'personal-care', 'care', 8, TRUE),
  ('33333333-3333-3333-3333-333333333009', 'Baby', 'الأطفال', 'baby', 'baby', 9, TRUE),
  ('33333333-3333-3333-3333-333333333010', 'Frozen Food', 'أطعمة مجمدة', 'frozen-food', 'frozen', 10, TRUE),
  ('33333333-3333-3333-3333-333333333011', 'Canned Food', 'معلبات', 'canned-food', 'canned', 11, TRUE),
  ('33333333-3333-3333-3333-333333333012', 'Snacks', 'وجبات خفيفة', 'snacks', 'snack', 12, TRUE),
  ('33333333-3333-3333-3333-333333333013', 'Bakery', 'مخبوزات', 'bakery', 'bakery', 13, TRUE),
  ('33333333-3333-3333-3333-333333333014', 'Household', 'مستلزمات المنزل', 'household', 'home', 14, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Products (30+ demo products including basket scenario items)
INSERT INTO products (
  id, name_en, name_ar, normalized_name, brand_id, category_id,
  variant_en, variant_ar, size_value, size_unit, package_quantity,
  package_description_en, package_description_ar, product_type, price_basis, active
) VALUES
  -- Validation scenario 1: Almarai Full Fat Milk 2L
  ('44444444-4444-4444-4444-444444444001', 'Almarai Full Fat Milk', 'حليب المراعي كامل الدسم', 'almarai full fat milk',
   '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333001',
   'Full Fat', 'كامل الدسم', 2, 'L', 1, '2L bottle', 'زجاجة 2 لتر', 'packaged', 'package', TRUE),

  -- Basket demo products
  ('44444444-4444-4444-4444-444444444002', 'Fresh Eggs 30 Pack', 'بيض طازج عبوة 30', 'fresh eggs 30 pack',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333001',
   'Large', 'كبير', 30, 'piece', 1, '30 eggs', '30 بيضة', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444003', 'Basmati Rice', 'أرز بسمتي', 'basmati rice',
   '22222222-2222-2222-2222-222222222004', '33333333-3333-3333-3333-333333333003',
   'Premium', 'فاخر', 10, 'kg', 1, '10kg bag', 'كيس 10 كجم', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444004', 'Afia Sunflower Oil', 'زيت عافية دوار الشمس', 'afia sunflower oil',
   '22222222-2222-2222-2222-222222222003', '33333333-3333-3333-3333-333333333004',
   'Sunflower', 'دوار الشمس', 1.5, 'L', 1, '1.5L bottle', 'زجاجة 1.5 لتر', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444005', 'Tide Automatic Detergent', 'تايد أوتوماتيك', 'tide automatic detergent',
   '22222222-2222-2222-2222-222222222006', '33333333-3333-3333-3333-333333333007',
   'Automatic', 'أوتوماتيك', 5, 'kg', 1, '5kg pack', 'عبوة 5 كجم', 'packaged', 'package', TRUE),

  -- Additional catalogue
  ('44444444-4444-4444-4444-444444444006', 'Almarai Full Fat Milk', 'حليب المراعي كامل الدسم', 'almarai full fat milk',
   '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333001',
   'Full Fat', 'كامل الدسم', 1, 'L', 1, '1L carton', 'كرتون 1 لتر', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444007', 'Nadec Full Fat Milk', 'حليب نادك كامل الدسم', 'nadec full fat milk',
   '22222222-2222-2222-2222-222222222002', '33333333-3333-3333-3333-333333333001',
   'Full Fat', 'كامل الدسم', 2, 'L', 1, '2L bottle', 'زجاجة 2 لتر', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444008', 'Almarai Labneh', 'لبنة المراعي', 'almarai labneh',
   '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333001',
   'Original', 'أصلي', 400, 'g', 1, '400g tub', 'علبة 400 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444009', 'Almarai Yogurt', 'زبادي المراعي', 'almarai yogurt',
   '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333001',
   'Plain', 'سادة', 170, 'g', 6, '6x170g', '6×170 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444010', 'Abu Kass Basmati Rice', 'أرز أبو كاس بسمتي', 'abu kass basmati rice',
   '22222222-2222-2222-2222-222222222005', '33333333-3333-3333-3333-333333333003',
   'Indian', 'هندي', 5, 'kg', 1, '5kg bag', 'كيس 5 كجم', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444011', 'Persil Gel Detergent', 'برسيل جل', 'persil gel detergent',
   '22222222-2222-2222-2222-222222222007', '33333333-3333-3333-3333-333333333007',
   'Gel', 'جل', 2.5, 'L', 1, '2.5L bottle', 'زجاجة 2.5 لتر', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444012', 'Pepsi Soft Drink', 'بيبسي مشروب غازي', 'pepsi soft drink',
   '22222222-2222-2222-2222-222222222008', '33333333-3333-3333-3333-333333333005',
   'Classic', 'كلاسيك', 330, 'ml', 6, '6x330ml', '6×330 مل', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444013', 'Coca-Cola Soft Drink', 'كوكا كولا مشروب غازي', 'coca cola soft drink',
   '22222222-2222-2222-2222-222222222009', '33333333-3333-3333-3333-333333333005',
   'Classic', 'كلاسيك', 330, 'ml', 6, '6x330ml', '6×330 مل', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444014', 'Nadec Butter', 'زبدة نادك', 'nadec butter',
   '22222222-2222-2222-2222-222222222002', '33333333-3333-3333-3333-333333333001',
   'Unsalted', 'غير مملحة', 200, 'g', 1, '200g pack', 'علبة 200 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444015', 'Almarai Cheese Slices', 'جبن شرائح المراعي', 'almarai cheese slices',
   '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333001',
   'Cheddar', 'شيدر', 200, 'g', 1, '200g pack', 'علبة 200 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444016', 'White Sugar', 'سكر أبيض', 'white sugar',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333003',
   'Fine', 'ناعم', 5, 'kg', 1, '5kg bag', 'كيس 5 كجم', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444017', 'All Purpose Flour', 'دقيق متعدد الاستخدامات', 'all purpose flour',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333003',
   'Fine', 'ناعم', 10, 'kg', 1, '10kg bag', 'كيس 10 كجم', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444018', 'Tomato Paste', 'معجون طماطم', 'tomato paste',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333011',
   'Concentrated', 'مركز', 400, 'g', 1, '400g can', 'علبة 400 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444019', 'Tuna Chunks', 'تونة قطع', 'tuna chunks',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333011',
   'In Oil', 'بالزيت', 160, 'g', 1, '160g can', 'علبة 160 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444020', 'Potato Chips', 'شيبس بطاطس', 'potato chips',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333012',
   'Salted', 'مملح', 150, 'g', 1, '150g bag', 'كيس 150 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444021', 'Arabic Bread', 'خبز عربي', 'arabic bread',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333013',
   'White', 'أبيض', 10, 'piece', 1, '10 pieces', '10 أرغفة', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444022', 'Frozen Chicken', 'دجاج مجمد', 'frozen chicken',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333010',
   'Whole', 'كامل', 1, 'kg', 1, '1kg', '1 كجم', 'packaged', 'kg', TRUE),
  ('44444444-4444-4444-4444-444444444023', 'Baby Diapers', 'حفاضات أطفال', 'baby diapers',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333009',
   'Size 4', 'مقاس 4', 48, 'piece', 1, '48 count', '48 قطعة', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444024', 'Shampoo', 'شامبو', 'shampoo',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333008',
   'Daily Care', 'عناية يومية', 400, 'ml', 1, '400ml bottle', 'زجاجة 400 مل', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444025', 'Dishwashing Liquid', 'سائل جلي', 'dishwashing liquid',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333007',
   'Lemon', 'ليمون', 750, 'ml', 1, '750ml bottle', 'زجاجة 750 مل', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444026', 'Tissue Paper', 'مناديل ورقية', 'tissue paper',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333014',
   'Soft', 'ناعم', 200, 'sheet', 5, '5 packs', '5 عبوات', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444027', 'Orange Juice', 'عصير برتقال', 'orange juice',
   '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333005',
   'Fresh', 'طازج', 1, 'L', 1, '1L carton', 'كرتون 1 لتر', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444028', 'Mineral Water', 'مياه معدنية', 'mineral water',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333005',
   'Still', 'مياه عادية', 330, 'ml', 24, '24x330ml', '24×330 مل', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444029', 'Instant Coffee', 'قهوة سريعة التحضير', 'instant coffee',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333005',
   'Classic', 'كلاسيك', 200, 'g', 1, '200g jar', 'علبة 200 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444030', 'Honey', 'عسل', 'honey',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333011',
   'Natural', 'طبيعي', 500, 'g', 1, '500g jar', 'علبة 500 جرام', 'packaged', 'package', TRUE),
  ('44444444-4444-4444-4444-444444444031', 'Tomatoes', 'طماطم', 'tomatoes',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333006',
   'Fresh', 'طازج', 1, 'kg', 1, 'per kg', 'بالكيلو', 'fresh', 'kg', TRUE),
  ('44444444-4444-4444-4444-444444444032', 'Chicken Breast', 'صدر دجاج', 'chicken breast',
   '22222222-2222-2222-2222-222222222010', '33333333-3333-3333-3333-333333333002',
   'Fresh', 'طازج', 1, 'kg', 1, 'per kg', 'بالكيلو', 'fresh', 'kg', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Active offer window (covers "today" for local demo)
-- Validation scenario 1 + basket split pricing:
-- Carrefour cheaper: milk, rice, tide
-- LuLu cheaper: eggs, oil
INSERT INTO supermarket_offers (
  id, product_id, supermarket_id,
  regular_price, offer_price, currency,
  promotion_type, promotion_description_en, promotion_description_ar,
  start_date, end_date, price_basis,
  unit_price, unit_price_unit, effective_price, display_price,
  country, city, verified, is_demo, active, validation_status
) VALUES
  -- Almarai Milk 2L — Carrefour 9.95 (best), LuLu 10.50
  ('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', '11111111-1111-1111-1111-111111111001',
   12.95, 9.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 4.9750, 'L', 9.95, 9.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', '11111111-1111-1111-1111-111111111002',
   12.50, 10.50, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 5.2500, 'L', 10.50, 10.50,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),

  -- Eggs 30 — LuLu cheaper
  ('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444002', '11111111-1111-1111-1111-111111111001',
   19.95, 17.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', NULL, NULL, 17.95, 17.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444002', '11111111-1111-1111-1111-111111111002',
   18.95, 15.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', NULL, NULL, 15.95, 15.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),

  -- Basmati Rice 10kg — Carrefour cheaper
  ('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444003', '11111111-1111-1111-1111-111111111001',
   79.95, 69.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 6.9950, 'kg', 69.95, 69.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444003', '11111111-1111-1111-1111-111111111002',
   82.00, 74.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 7.4950, 'kg', 74.95, 74.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),

  -- Afia Oil 1.5L — LuLu cheaper
  ('55555555-5555-5555-5555-555555555007', '44444444-4444-4444-4444-444444444004', '11111111-1111-1111-1111-111111111001',
   29.95, 27.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 18.6333, 'L', 27.95, 27.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555008', '44444444-4444-4444-4444-444444444004', '11111111-1111-1111-1111-111111111002',
   28.95, 25.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 17.3000, 'L', 25.95, 25.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),

  -- Tide 5kg — Carrefour cheaper
  ('55555555-5555-5555-5555-555555555009', '44444444-4444-4444-4444-444444444005', '11111111-1111-1111-1111-111111111001',
   49.95, 39.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 7.9900, 'kg', 39.95, 39.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555010', '44444444-4444-4444-4444-444444444005', '11111111-1111-1111-1111-111111111002',
   52.00, 44.95, 'SAR', 'standard_discount', 'Weekly offer', 'عرض الأسبوع',
   CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 8.9900, 'kg', 44.95, 44.95,
   'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid')
ON CONFLICT (id) DO NOTHING;

-- Extra deterministic offers for catalogue browsing
INSERT INTO supermarket_offers (
  id, product_id, supermarket_id,
  regular_price, offer_price, currency, promotion_type,
  start_date, end_date, price_basis, effective_price, display_price,
  country, city, verified, is_demo, active, validation_status
) VALUES
  ('55555555-5555-5555-5555-555555555011', '44444444-4444-4444-4444-444444444006', '11111111-1111-1111-1111-111111111001',
   6.50, 5.75, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 5.75, 5.75, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555012', '44444444-4444-4444-4444-444444444006', '11111111-1111-1111-1111-111111111002',
   6.75, 5.95, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 5.95, 5.95, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555013', '44444444-4444-4444-4444-444444444007', '11111111-1111-1111-1111-111111111001',
   11.95, 10.25, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 10.25, 10.25, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555014', '44444444-4444-4444-4444-444444444007', '11111111-1111-1111-1111-111111111002',
   11.50, 9.95, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 9.95, 9.95, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555015', '44444444-4444-4444-4444-444444444010', '11111111-1111-1111-1111-111111111001',
   42.00, 36.95, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 36.95, 36.95, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555016', '44444444-4444-4444-4444-444444444010', '11111111-1111-1111-1111-111111111002',
   41.00, 35.50, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 35.50, 35.50, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555017', '44444444-4444-4444-4444-444444444012', '11111111-1111-1111-1111-111111111001',
   14.95, 12.95, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 12.95, 12.95, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555018', '44444444-4444-4444-4444-444444444012', '11111111-1111-1111-1111-111111111002',
   15.50, 13.50, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 13.50, 13.50, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555019', '44444444-4444-4444-4444-444444444013', '11111111-1111-1111-1111-111111111001',
   14.95, 13.25, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 13.25, 13.25, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid'),
  ('55555555-5555-5555-5555-555555555020', '44444444-4444-4444-4444-444444444013', '11111111-1111-1111-1111-111111111002',
   14.50, 12.75, 'SAR', 'standard_discount', CURRENT_DATE - 2, CURRENT_DATE + 12, 'package', 12.75, 12.75, 'SA', 'Riyadh', FALSE, TRUE, TRUE, 'valid')
ON CONFLICT (id) DO NOTHING;
