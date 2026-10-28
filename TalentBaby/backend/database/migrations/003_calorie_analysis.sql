-- Migration 003: Calorie Analysis System
-- calorie analysis system

-- 1. food database (Food Database)
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ko VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    -- 'grains', 'vegetables', 'fruits', 'meat', 'fish and shellfish', 'dairy products', 'pulses', 'oils and fats', 'drink', 'snack'
    calories_per_100g DECIMAL(8, 2) NOT NULL,   -- kcal
    protein_per_100g  DECIMAL(8, 2) DEFAULT 0,  -- g
    fat_per_100g      DECIMAL(8, 2) DEFAULT 0,  -- g
    carbs_per_100g    DECIMAL(8, 2) DEFAULT 0,  -- g
    fiber_per_100g    DECIMAL(8, 2) DEFAULT 0,  -- g
    sugar_per_100g    DECIMAL(8, 2) DEFAULT 0,  -- g
    sodium_per_100g   DECIMAL(8, 2) DEFAULT 0,  -- mg
    calcium_per_100g  DECIMAL(8, 2) DEFAULT 0,  -- mg
    iron_per_100g     DECIMAL(8, 2) DEFAULT 0,  -- mg
    is_baby_food      BOOLEAN DEFAULT false,     -- baby food/baby food or not
    min_age_months    INTEGER,                   -- Minimum age for consumption
    allergens         TEXT[] DEFAULT '{}',       -- allergenic ingredients
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. meal history (Food Intake Log)
CREATE TABLE IF NOT EXISTS food_intake_logs (
    id SERIAL PRIMARY KEY,
    baby_id   INTEGER REFERENCES babies(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id   INTEGER NOT NULL REFERENCES foods(id),
    log_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type VARCHAR(20) NOT NULL DEFAULT 'snack',
    -- 'breakfast'(morning), 'lunch'(lunch), 'dinner'(dinner), 'snack'(snack), 'breastmilk'(breast milk), 'formula'(powdered milk)
    amount_g  DECIMAL(8, 2) NOT NULL,           -- intake (g or ml)
    -- calculated field (Direct calculation without trigger)
    calories  DECIMAL(8, 2) GENERATED ALWAYS AS (amount_g / 100.0 * 0) STORED, -- Calculate from the view below
    notes     TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- caloriesis calculated as a view (GENERATED ALWAYS with subquery Impossible)
ALTER TABLE food_intake_logs DROP COLUMN IF EXISTS calories;
ALTER TABLE food_intake_logs ADD COLUMN calories DECIMAL(8, 2);

-- 3. Recommended calories by age (Age-based Calorie Recommendations, Korean nutritional intake standards)
CREATE TABLE IF NOT EXISTS calorie_recommendations (
    id SERIAL PRIMARY KEY,
    age_min_months  INTEGER NOT NULL,
    age_max_months  INTEGER NOT NULL,
    gender          VARCHAR(10) DEFAULT 'all',  -- 'all', 'male', 'female'
    kcal_per_day    INTEGER NOT NULL,
    protein_g       DECIMAL(5, 1),
    fat_g           DECIMAL(5, 1),
    carbs_g         DECIMAL(5, 1),
    calcium_mg      DECIMAL(7, 1),
    iron_mg         DECIMAL(5, 1),
    label           VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Daily Calorie Summary (For cache — Optional, Can be replaced with aggregate queries)
CREATE TABLE IF NOT EXISTS daily_calorie_summary (
    id SERIAL PRIMARY KEY,
    baby_id       INTEGER REFERENCES babies(id) ON DELETE CASCADE,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date  DATE NOT NULL,
    total_calories DECIMAL(8, 2) DEFAULT 0,
    total_protein  DECIMAL(8, 2) DEFAULT 0,
    total_fat      DECIMAL(8, 2) DEFAULT 0,
    total_carbs    DECIMAL(8, 2) DEFAULT 0,
    meal_count     INTEGER DEFAULT 0,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(baby_id, summary_date),
    UNIQUE(user_id, summary_date, baby_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_is_baby_food ON foods(is_baby_food);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_food_intake_logs_baby_date ON food_intake_logs(baby_id, log_date);
CREATE INDEX IF NOT EXISTS idx_food_intake_logs_user_date ON food_intake_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_calorie_rec_age ON calorie_recommendations(age_min_months, age_max_months);

-- ─── Seed: Recommended calories by age (Korean Nutritional Intake Standards 2020) ───────────────────────────
INSERT INTO calorie_recommendations (age_min_months, age_max_months, gender, kcal_per_day, protein_g, fat_g, carbs_g, calcium_mg, iron_mg, label) VALUES
(0,  5,  'all',    550,  10.0, 31.0,  60.0, 200.0, 0.3,  '0~5months'),
(6,  11, 'all',    700,  15.0, 25.0,  90.0, 300.0, 6.0,  '6~11months'),
(12, 23, 'all',    900,  20.0, 25.0, 120.0, 500.0, 6.0,  '12~23months'),
(24, 35, 'male',  1100,  25.0, 25.0, 150.0, 500.0, 6.0,  '2~3three men'),
(24, 35, 'female',1000,  25.0, 25.0, 130.0, 500.0, 6.0,  '2~3three women'),
(36, 47, 'male',  1300,  30.0, 25.0, 180.0, 600.0, 7.0,  '3~4three men'),
(36, 47, 'female',1200,  30.0, 25.0, 160.0, 600.0, 7.0,  '3~4three women'),
(48, 71, 'male',  1500,  35.0, 25.0, 210.0, 700.0, 8.0,  '4~6three men'),
(48, 71, 'female',1400,  35.0, 25.0, 190.0, 700.0, 8.0,  '4~6three women')
ON CONFLICT DO NOTHING;

-- ─── Seed: food database (Korean Baby Foods + Common Foods) ──────────────
INSERT INTO foods (name, name_ko, category, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, sodium_per_100g, calcium_per_100g, iron_per_100g, is_baby_food, min_age_months, allergens) VALUES
-- baby food / baby food
('Rice porridge (plain)',    'rice cake',         'grains',   55,  1.2, 0.2, 12.0, 0.1,   2.0,  2.0, 0.1, true,  4, '{}'),
('Rice porridge (thick)',    'rice porridge',           'grains',   72,  1.5, 0.3, 15.8, 0.2,   3.0,  3.0, 0.2, true,  6, '{}'),
('Sweet potato puree',       'Sweet Potato Puree',    'vegetables', 86,  1.6, 0.1, 20.1, 3.0,  55.0, 30.0, 0.6, true,  5, '{}'),
('Carrot puree',             'carrot puree',      'vegetables', 41,  0.9, 0.2,  9.6, 2.8,  69.0, 33.0, 0.3, true,  5, '{}'),
('Broccoli puree',           'Broccoli Puree',  'vegetables', 34,  2.8, 0.4,  6.6, 2.6,  33.0, 47.0, 0.7, true,  6, '{}'),
('Apple puree',              'apple puree',      'fruits', 52,  0.3, 0.2, 13.8, 2.4,   1.0,  6.0, 0.1, true,  4, '{}'),
('Banana mash',              'mashed banana', 'fruits', 89,  1.1, 0.3, 22.8, 2.6,   1.0,  5.0, 0.3, true,  5, '{}'),
('Pear puree',               'pear puree',        'fruits', 58,  0.4, 0.1, 15.5, 3.1,   1.0,  9.0, 0.2, true,  4, '{}'),
('Chicken puree',            'Chicken Puree',    'meat',  165, 20.0, 9.0,   0.0, 0.0,  65.0, 11.0, 1.0, true,  6, '{}'),
('Beef puree',               'beef puree',   'meat',  250, 17.0,20.0,   0.0, 0.0,  72.0,  6.0, 2.6, true,  6, '{}'),
('Tofu',                     'tofu',           'pulses',   76,  8.1, 4.2,  1.9, 0.3,   7.0, 130.0, 1.6, true,  6, '{}'),
('Plain yogurt',             'plain yogurt',  'dairy products', 61,  3.5, 3.3,  4.7, 0.0,  46.0, 121.0, 0.1, true,  6, '{dairy products}'),
('Breast milk (100ml)',      'breast milk (100ml)',   'drink',   65,  1.1, 3.5,  7.2, 0.0,  17.0, 32.0, 0.0, true,  0, '{}'),
('Formula milk (100ml)',     'powdered milk (100ml)',   'drink',   68,  1.5, 3.6,  7.5, 0.0,  28.0, 53.0, 1.0, true,  0, '{dairy products}'),
-- general food
('White rice (cooked)',      'white rice',           'grains',  130,  2.5, 0.3, 28.7, 0.3,   1.0,  3.0, 0.2, false, 12, '{}'),
('Egg',                      'egg',           'meat',  155, 13.0,11.0,  1.1, 0.0, 124.0, 56.0, 1.8, false,  9, '{egg}'),
('Salmon',                   'salmon',           'fish and shellfish',208, 20.0,13.4,  0.0, 0.0,  59.0, 12.0, 0.3, false,  8, '{fish and shellfish}'),
('Spinach',                  'spinach',         'vegetables', 23,  2.9, 0.4,  3.6, 2.2,  79.0, 99.0, 2.7, false,  8, '{}'),
('Avocado',                  'avocado',       'fruits',160,  2.0,14.7,  8.5, 6.7,   7.0, 12.0, 0.6, false,  6, '{}'),
('Whole milk',               'milk',           'dairy products', 61,  3.2, 3.3,  4.8, 0.0,  43.0, 113.0, 0.0, false, 12, '{dairy products}'),
('Oatmeal (cooked)',         'oatmeal',         'grains',   71,  2.5, 1.4, 12.0, 1.7,  49.0, 10.0, 0.7, false,  6, '{gluten}'),
('Lentils (cooked)',         'lentils',         'pulses',  116,  9.0, 0.4, 20.0, 7.9,   2.0, 19.0, 3.3, false,  8, '{}'),
('Pumpkin puree',            'Sweet pumpkin puree',    'vegetables', 26,  1.0, 0.1,  6.5, 0.5,   1.0, 21.0, 0.8, true,   5, '{}'),
('Cod fish',                 'cod meat',         'fish and shellfish', 82, 17.8, 0.7,  0.0, 0.0,  54.0, 16.0, 0.4, true,   7, '{fish and shellfish}'),
('Cheese (cheddar)',         'Cheddar Cheese',       'dairy products',402, 25.0,33.1,  1.3, 0.0, 621.0,721.0, 0.7, false, 10, '{dairy products}')
ON CONFLICT DO NOTHING;
