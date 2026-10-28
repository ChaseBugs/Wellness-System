-- Migration 008: Nutrition & Benefits — nutrient categories and food items

CREATE TABLE IF NOT EXISTS nutrition_categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,          -- Carbohydrates, Proteins, Vitamin A …
  description TEXT,
  icon_url    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nutrition_foods (
  id              SERIAL PRIMARY KEY,
  category_id     INTEGER NOT NULL REFERENCES nutrition_categories(id) ON DELETE CASCADE,
  name            VARCHAR(150) NOT NULL,       -- Cereals & Grains, Spinach …
  description     TEXT,
  image_url       TEXT,
  is_vegetarian   BOOLEAN NOT NULL DEFAULT TRUE,
  -- comma-separated age groups: '0-6,7-11,12-17' or NULL = all groups
  age_groups      TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nutrition_foods_category ON nutrition_foods(category_id);

-- ─── Seed nutrient categories ─────────────────────────────────────────────
INSERT INTO nutrition_categories (name, description, sort_order) VALUES
  ('Carbohydrates', 'Primary energy source for growing babies',                1),
  ('Proteins',      'Essential for muscle and tissue development',             2),
  ('Vitamin A',     'Supports vision, immune system, and skin health',         3),
  ('Vitamin B',     'Supports energy metabolism and brain development',        4),
  ('Vitamin C',     'Boosts immunity and helps iron absorption',               5),
  ('Vitamin D',     'Essential for bone and teeth development',                6),
  ('Vitamin E',     'Antioxidant that protects cells',                         7),
  ('Calcium',       'Builds strong bones and teeth',                           8),
  ('Iron',          'Prevents anaemia and supports brain development',         9),
  ('Iodine',        'Critical for thyroid function and brain development',    10),
  ('Folate',        'Supports cell growth and DNA synthesis',                 11),
  ('DHA & ARA',     'Omega-3 and omega-6 for brain and eye development',      12),
  ('Zinc',          'Supports immune function and growth',                    13),
  ('Vitamin B12',   'Essential for nerve function and red blood cells',       14),
  ('Potassium',     'Regulates fluid balance and muscle function',            15)
ON CONFLICT DO NOTHING;

-- ─── Seed nutrition foods ─────────────────────────────────────────────────
-- Carbohydrates (id=1)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (1, 'Cereals & Grains',      TRUE,  '7-11,12-17,18-24,25-30,31-36', 1),
  (1, 'Fruits & Vegetables',   TRUE,  '7-11,12-17,18-24,25-30,31-36', 2),
  (1, 'Dairy Products',        TRUE,  '7-11,12-17,18-24,25-30,31-36', 3),
  (1, 'Breast Milk / Formula', TRUE,  '0-6,7-11',                     4),
  (1, 'Sweet Potato',          TRUE,  '7-11,12-17,18-24',             5),
  (1, 'Oatmeal',               TRUE,  '7-11,12-17,18-24,25-30,31-36', 6)
ON CONFLICT DO NOTHING;

-- Proteins (id=2)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (2, 'Pulses & Legumes',  TRUE,  '7-11,12-17,18-24,25-30,31-36', 1),
  (2, 'Beans',             TRUE,  '7-11,12-17,18-24,25-30,31-36', 2),
  (2, 'Dairy Products',    TRUE,  '7-11,12-17,18-24,25-30,31-36', 3),
  (2, 'Chicken',           FALSE, '12-17,18-24,25-30,31-36',       4),
  (2, 'Eggs',              FALSE, '7-11,12-17,18-24,25-30,31-36', 5),
  (2, 'Fish',              FALSE, '12-17,18-24,25-30,31-36',       6),
  (2, 'Tofu',              TRUE,  '7-11,12-17,18-24,25-30,31-36', 7)
ON CONFLICT DO NOTHING;

-- Vitamin A (id=3)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (3, 'Spinach',         TRUE, '7-11,12-17,18-24,25-30,31-36', 1),
  (3, 'Pumpkin',         TRUE, '7-11,12-17,18-24,25-30,31-36', 2),
  (3, 'Papaya',          TRUE, '7-11,12-17,18-24,25-30,31-36', 3),
  (3, 'Mango',           TRUE, '7-11,12-17,18-24,25-30,31-36', 4),
  (3, 'Carrot',          TRUE, '7-11,12-17,18-24,25-30,31-36', 5),
  (3, 'Sweet Potato',    TRUE, '7-11,12-17,18-24,25-30,31-36', 6),
  (3, 'Egg Yolk',        FALSE,'7-11,12-17,18-24,25-30,31-36', 7)
ON CONFLICT DO NOTHING;

-- Vitamin B (id=4)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (4, 'Whole Grains', TRUE,  '7-11,12-17,18-24,25-30,31-36', 1),
  (4, 'Milk',         TRUE,  '12-17,18-24,25-30,31-36',       2),
  (4, 'Cheese',       TRUE,  '12-17,18-24,25-30,31-36',       3),
  (4, 'Eggs',         FALSE, '7-11,12-17,18-24,25-30,31-36', 4),
  (4, 'Banana',       TRUE,  '7-11,12-17,18-24,25-30,31-36', 5),
  (4, 'Avocado',      TRUE,  '7-11,12-17,18-24,25-30,31-36', 6)
ON CONFLICT DO NOTHING;

-- Vitamin C (id=5)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (5, 'Amla',       TRUE, '12-17,18-24,25-30,31-36', 1),
  (5, 'Orange',     TRUE, '7-11,12-17,18-24,25-30,31-36', 2),
  (5, 'Sweet Lime', TRUE, '7-11,12-17,18-24,25-30,31-36', 3),
  (5, 'Kiwi',       TRUE, '12-17,18-24,25-30,31-36', 4),
  (5, 'Strawberry', TRUE, '12-17,18-24,25-30,31-36', 5),
  (5, 'Broccoli',   TRUE, '7-11,12-17,18-24,25-30,31-36', 6),
  (5, 'Bell Pepper',TRUE, '12-17,18-24,25-30,31-36', 7)
ON CONFLICT DO NOTHING;

-- Vitamin D (id=6)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (6, 'Egg',                       FALSE, '7-11,12-17,18-24,25-30,31-36', 1),
  (6, 'Fish',                      FALSE, '12-17,18-24,25-30,31-36',       2),
  (6, 'Vitamin D Fortified Food',  TRUE,  '0-6,7-11,12-17,18-24,25-30,31-36', 3),
  (6, 'Sunlight Exposure',         TRUE,  '0-6,7-11,12-17,18-24,25-30,31-36', 4),
  (6, 'Fortified Cereal',          TRUE,  '7-11,12-17,18-24,25-30,31-36', 5)
ON CONFLICT DO NOTHING;

-- Vitamin E (id=7)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (7, 'Whole Grains',             TRUE,  '7-11,12-17,18-24,25-30,31-36', 1),
  (7, 'Fortified Grain Products', TRUE,  '7-11,12-17,18-24,25-30,31-36', 2),
  (7, 'Fish Oils',                FALSE, '12-17,18-24,25-30,31-36',       3),
  (7, 'Vegetable Oils',           TRUE,  '7-11,12-17,18-24,25-30,31-36', 4),
  (7, 'Almonds',                  TRUE,  '18-24,25-30,31-36',             5),
  (7, 'Sunflower Seeds',          TRUE,  '18-24,25-30,31-36',             6)
ON CONFLICT DO NOTHING;

-- Calcium (id=8)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (8, 'Dairy Products',           TRUE,  '7-11,12-17,18-24,25-30,31-36', 1),
  (8, 'Seeds Like Sesame',        TRUE,  '12-17,18-24,25-30,31-36',       2),
  (8, 'Garden Cress Seeds',       TRUE,  '12-17,18-24,25-30,31-36',       3),
  (8, 'Amaranth Seeds (Rajgeer)', TRUE,  '12-17,18-24,25-30,31-36',       4),
  (8, 'Broccoli',                 TRUE,  '7-11,12-17,18-24,25-30,31-36', 5),
  (8, 'Tofu',                     TRUE,  '7-11,12-17,18-24,25-30,31-36', 6)
ON CONFLICT DO NOTHING;

-- Iron (id=9)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (9, 'Bajra',                    TRUE,  '7-11,12-17,18-24,25-30,31-36', 1),
  (9, 'Quinoa',                   TRUE,  '7-11,12-17,18-24,25-30,31-36', 2),
  (9, 'Ragi',                     TRUE,  '7-11,12-17,18-24,25-30,31-36', 3),
  (9, 'Amaranth Seeds',           TRUE,  '12-17,18-24,25-30,31-36',       4),
  (9, 'Spinach',                  TRUE,  '7-11,12-17,18-24,25-30,31-36', 5),
  (9, 'Lentils',                  TRUE,  '7-11,12-17,18-24,25-30,31-36', 6),
  (9, 'Chicken Liver',            FALSE, '12-17,18-24,25-30,31-36',       7)
ON CONFLICT DO NOTHING;

-- Iodine (id=10)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (10, 'Iodised Salt',    TRUE,  '12-17,18-24,25-30,31-36',       1),
  (10, 'Dairy Products',  TRUE,  '7-11,12-17,18-24,25-30,31-36', 2),
  (10, 'Fish',            FALSE, '12-17,18-24,25-30,31-36',       3),
  (10, 'Soybean',         TRUE,  '12-17,18-24,25-30,31-36',       4),
  (10, 'Eggs',            FALSE, '7-11,12-17,18-24,25-30,31-36', 5)
ON CONFLICT DO NOTHING;

-- Folate (id=11)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (11, 'Green Leafy Vegetables', TRUE, '7-11,12-17,18-24,25-30,31-36', 1),
  (11, 'Oranges',                TRUE, '7-11,12-17,18-24,25-30,31-36', 2),
  (11, 'Whole Grains',           TRUE, '7-11,12-17,18-24,25-30,31-36', 3),
  (11, 'Cereals',                TRUE, '7-11,12-17,18-24,25-30,31-36', 4),
  (11, 'Lentils',                TRUE, '7-11,12-17,18-24,25-30,31-36', 5),
  (11, 'Avocado',                TRUE, '7-11,12-17,18-24,25-30,31-36', 6)
ON CONFLICT DO NOTHING;

-- DHA & ARA (id=12)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (12, 'Fish',                        FALSE, '12-17,18-24,25-30,31-36',       1),
  (12, 'Flaxseeds',                   TRUE,  '12-17,18-24,25-30,31-36',       2),
  (12, 'Walnuts',                     TRUE,  '18-24,25-30,31-36',             3),
  (12, 'Other Starchy Vegetables',    TRUE,  '7-11,12-17,18-24,25-30,31-36', 4),
  (12, 'DHA-Fortified Formula',       TRUE,  '0-6,7-11',                      5),
  (12, 'Chia Seeds',                  TRUE,  '18-24,25-30,31-36',             6)
ON CONFLICT DO NOTHING;

-- Zinc (id=13)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (13, 'Meat',    FALSE, '12-17,18-24,25-30,31-36',       1),
  (13, 'Liver',   FALSE, '12-17,18-24,25-30,31-36',       2),
  (13, 'Chicken', FALSE, '12-17,18-24,25-30,31-36',       3),
  (13, 'Eggs',    FALSE, '7-11,12-17,18-24,25-30,31-36', 4),
  (13, 'Lentils', TRUE,  '7-11,12-17,18-24,25-30,31-36', 5),
  (13, 'Pumpkin Seeds', TRUE, '18-24,25-30,31-36',         6)
ON CONFLICT DO NOTHING;

-- Vitamin B12 (id=14)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (14, 'Meat',            FALSE, '12-17,18-24,25-30,31-36',       1),
  (14, 'Egg Yolks',       FALSE, '7-11,12-17,18-24,25-30,31-36', 2),
  (14, 'Dairy Products',  TRUE,  '7-11,12-17,18-24,25-30,31-36', 3),
  (14, 'Fish',            FALSE, '12-17,18-24,25-30,31-36',       4),
  (14, 'Fortified Cereal',TRUE,  '7-11,12-17,18-24,25-30,31-36', 5)
ON CONFLICT DO NOTHING;

-- Potassium (id=15)
INSERT INTO nutrition_foods (category_id, name, is_vegetarian, age_groups, sort_order) VALUES
  (15, 'Fruits',                 TRUE, '7-11,12-17,18-24,25-30,31-36', 1),
  (15, 'Potato',                 TRUE, '7-11,12-17,18-24,25-30,31-36', 2),
  (15, 'Green Leafy Vegetables', TRUE, '7-11,12-17,18-24,25-30,31-36', 3),
  (15, 'Tomato',                 TRUE, '7-11,12-17,18-24,25-30,31-36', 4),
  (15, 'Banana',                 TRUE, '7-11,12-17,18-24,25-30,31-36', 5),
  (15, 'Sweet Potato',           TRUE, '7-11,12-17,18-24,25-30,31-36', 6)
ON CONFLICT DO NOTHING;
