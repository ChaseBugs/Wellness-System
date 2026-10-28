-- Migration 004: Meal Recommendation System
-- Recommended meals for each baby’s age

-- 1. Meal Recommendation Template (Meal Plan Templates)
CREATE TABLE IF NOT EXISTS meal_plan_templates (
    id SERIAL PRIMARY KEY,
    age_min_months  INTEGER NOT NULL,
    age_max_months  INTEGER NOT NULL,
    meal_type       VARCHAR(20) NOT NULL,   -- 'breakfast','lunch','dinner','snack','breastmilk','formula'
    title           VARCHAR(255) NOT NULL,  -- e.g. 'morning - rice cake + apple puree'
    description     TEXT,                  -- preparation tips, Cooking Instructions Notes
    total_kcal_approx INTEGER,             -- Estimated calories for this meal
    stage_label     VARCHAR(50),           -- 'early baby food', 'Mid-term baby food', 'Baby food reviews', 'baby food'
    sort_order      INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Food list by template (Includes recommended intake)
CREATE TABLE IF NOT EXISTS meal_plan_foods (
    id SERIAL PRIMARY KEY,
    template_id     INTEGER NOT NULL REFERENCES meal_plan_templates(id) ON DELETE CASCADE,
    food_id         INTEGER NOT NULL REFERENCES foods(id),
    recommended_g   DECIMAL(6,1) NOT NULL,  -- recommended intake (g or ml)
    unit            VARCHAR(10) DEFAULT 'g', -- 'g', 'ml'
    notes           TEXT                     -- 'Do not add salt', 'Serve crushed' etc.
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_age ON meal_plan_templates(age_min_months, age_max_months);
CREATE INDEX IF NOT EXISTS idx_meal_plan_foods_template ON meal_plan_foods(template_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED: Meal recommendations by age
-- Food IDs:
--  1=rice cake, 2=rice porridge, 3=Sweet Potato Puree, 4=Carrot Puree, 5=Broccoli Puree
--  6=Apple Puree, 7=banana, 8=pear puree, 9=Chicken puree, 10=Beef Puree
-- 11=tofu, 12=yogurt, 13=breast milk, 14=powdered milk, 15=white rice
-- 16=egg, 17=salmon, 18=spinach, 19=avocado, 20=milk
-- 21=oatmeal, 22=lentils, 23=Sweet pumpkin puree, 24=cod meat, 25=Cheddar Cheese
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 0~5months: full breast milk/formula feeding ───────────────────────────────────────────
INSERT INTO meal_plan_templates (age_min_months, age_max_months, meal_type, title, description, total_kcal_approx, stage_label, sort_order) VALUES
(0, 5, 'breastmilk', 'morning feeding — breast milk or formula', '2~3Feed at intervals. At this stage, all nutritional needs are met through breast milk or formula alone..', 65, 'full lactation period', 1),
(0, 5, 'breastmilk', 'lunch feeding — breast milk or formula', NULL, 65, 'full lactation period', 2),
(0, 5, 'breastmilk', 'evening feeding — breast milk or formula', NULL, 65, 'full lactation period', 3),
(0, 5, 'breastmilk', 'night feeding — breast milk or formula', 'Provide night feedings when your baby wants them..', 65, 'full lactation period', 4);

INSERT INTO meal_plan_foods (template_id, food_id, recommended_g, unit, notes) VALUES
((SELECT id FROM meal_plan_templates WHERE age_min_months=0 AND meal_type='breastmilk' AND sort_order=1), 13, 120, 'ml', 'Adjust according to demand'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=0 AND meal_type='breastmilk' AND sort_order=2), 13, 120, 'ml', NULL),
((SELECT id FROM meal_plan_templates WHERE age_min_months=0 AND meal_type='breastmilk' AND sort_order=3), 13, 120, 'ml', NULL),
((SELECT id FROM meal_plan_templates WHERE age_min_months=0 AND meal_type='breastmilk' AND sort_order=4), 13, 100, 'ml', NULL);

-- ─── 6~7months: early baby food ────────────────────────────────────────────────────
INSERT INTO meal_plan_templates (age_min_months, age_max_months, meal_type, title, description, total_kcal_approx, stage_label, sort_order) VALUES
(6, 7, 'breastmilk', 'morning — breast milk/powdered milk', 'Start your day with feeding before starting baby food..', 68, 'early baby food', 1),
(6, 7, 'lunch',      'lunch — rice cake + vegetable puree', '10Baejuk(rice cake)Add single-ingredient purees, starting with 1 at a time.. Check for allergies by adding new ingredients every 3 days..', 55, 'early baby food', 2),
(6, 7, 'breastmilk', 'dinner — breast milk/powdered milk', 'After weaning, supplement any nutritional deficiencies through breastfeeding..', 68, 'early baby food', 3),
(6, 7, 'snack',      'snack — fruit puree', 'Serve small amounts of apple or pear puree. The natural sweetness of fruit helps children become familiar with baby food..', 26, 'early baby food', 4);

INSERT INTO meal_plan_foods (template_id, food_id, recommended_g, unit, notes) VALUES
-- morning feeding
((SELECT id FROM meal_plan_templates WHERE age_min_months=6 AND meal_type='breastmilk' AND sort_order=1), 14, 180, 'ml', 'formula or breast milk'),
-- lunch baby food
((SELECT id FROM meal_plan_templates WHERE age_min_months=6 AND meal_type='lunch'), 1,  30, 'g', 'rice cake (10Baejuk)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=6 AND meal_type='lunch'), 4,  20, 'g', 'Carrot Puree or Sweet Potato Puree'),
-- evening feeding
((SELECT id FROM meal_plan_templates WHERE age_min_months=6 AND meal_type='breastmilk' AND sort_order=3), 14, 180, 'ml', NULL),
-- snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=6 AND meal_type='snack'), 6, 30, 'g', 'apple puree (Prepare for the day)');

-- ─── 8~9months: Mid-term baby food ────────────────────────────────────────────────────
INSERT INTO meal_plan_templates (age_min_months, age_max_months, meal_type, title, description, total_kcal_approx, stage_label, sort_order) VALUES
(8, 9, 'breakfast', 'morning — oatmeal + fruit puree',      'Oatmeal is rich in iron and fiber. Add sweetness with banana or apple puree..', 80,  'Mid-term baby food', 1),
(8, 9, 'lunch',     'lunch — rice porridge + protein + vegetables',    'Add chicken or tofu for protein. Up to two types of vegetables can be mixed..', 115, 'Mid-term baby food', 2),
(8, 9, 'dinner',    'dinner — rice porridge + vegetable puree',        'Dinner consists mainly of vegetables that are easy to digest..', 80,  'Mid-term baby food', 3),
(8, 9, 'snack',     'snack — yogurt + fruit',            'Plain yogurt is rich in calcium and lactic acid bacteria.. Please provide after checking for allergies..', 70,  'Mid-term baby food', 4);

INSERT INTO meal_plan_foods (template_id, food_id, recommended_g, unit, notes) VALUES
-- morning
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='breakfast'), 21, 40, 'g', 'oatmeal (Check for gluten allergy)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='breakfast'), 7,  30, 'g', 'mashed banana'),
-- lunch
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='lunch'), 2,  60, 'g', 'rice porridge (7Baejuk)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='lunch'), 9,  30, 'g', 'Chicken Puree (peel removal)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='lunch'), 5,  25, 'g', 'Broccoli Puree'),
-- dinner
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='dinner'), 2,  60, 'g', 'rice porridge'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='dinner'), 3,  30, 'g', 'Sweet Potato Puree'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='dinner'), 18, 20, 'g', 'Spinach Puree (iron supply)'),
-- snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='snack'), 12, 50, 'g', 'plain yogurt (sugar free)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=8 AND meal_type='snack'), 6,  30, 'g', 'apple puree');

-- ─── 10~12months: Baby food reviews ──────────────────────────────────────────────────
INSERT INTO meal_plan_templates (age_min_months, age_max_months, meal_type, title, description, total_kcal_approx, stage_label, sort_order) VALUES
(10, 12, 'breakfast', 'morning — soft tofu + mashed banana + powdered milk', 'When it comes to eggs, start with the yolk and check for allergies to the egg white..', 120, 'Baby food reviews', 1),
(10, 12, 'lunch',     'lunch — Jinbab + beef + 2 types of vegetables',   'Jinbab(5Baejuk)Start chewing practice with. Beef is essential for iron supply.', 160, 'Baby food reviews', 2),
(10, 12, 'dinner',    'dinner — Jinbab + fish + vegetables',         'white fish(Daegu)It is suitable for this period as it has few allergies..', 130, 'Baby food reviews', 3),
(10, 12, 'snack',     'morning snack — fruit + cheese',            'Serve only small amounts of cheddar cheese. (Sodium Caution).', 80,  'Baby food reviews', 4),
(10, 12, 'snack',     'afternoon snack — yogurt + avocado',       'Avocados Provide Good Fats and Calories.', 90,  'Baby food reviews', 5);

INSERT INTO meal_plan_foods (template_id, food_id, recommended_g, unit, notes) VALUES
-- morning
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='breakfast'), 11, 50, 'g', 'soft tofu (Mash it well)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='breakfast'), 7,  40, 'g', 'mashed banana'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='breakfast'), 14, 100,'ml','powdered milk (Supplementing insufficient calories)'),
-- lunch
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='lunch'), 2,  80, 'g', 'Jinbab (5Baejuk)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='lunch'), 10, 40, 'g', 'beef puree (chopped)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='lunch'), 5,  30, 'g', 'broccoli (Cut it small)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='lunch'), 4,  25, 'g', 'carrot (Boiled gently)'),
-- dinner
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='dinner'), 2,  80, 'g', 'Jinbab'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='dinner'), 24, 40, 'g', 'cod meat (completely remove thorn)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='dinner'), 18, 25, 'g', 'spinach'),
-- morning snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='snack' AND sort_order=4), 8,  50, 'g', 'pear puree'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='snack' AND sort_order=4), 25, 10, 'g', 'Cheddar Cheese (small amount)'),
-- afternoon snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='snack' AND sort_order=5), 12, 60, 'g', 'plain yogurt'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=10 AND meal_type='snack' AND sort_order=5), 19, 30, 'g', 'avocado (Crush it)');

-- ─── 13~24months: early baby food ──────────────────────────────────────────────────
INSERT INTO meal_plan_templates (age_min_months, age_max_months, meal_type, title, description, total_kcal_approx, stage_label, sort_order) VALUES
(13, 24, 'breakfast', 'morning — egg + rice + milk',       'Eggs are a complete food. Serve scrambled or soft-boiled.. Milk 400 per daymlDo not exceed.', 200, 'early baby food', 1),
(13, 24, 'lunch',     'lunch — rice + beef + 2 types of vegetables', 'It is structured similarly to an adult meal, but with liver.(salt/sugar)Minimize.', 250, 'early baby food', 2),
(13, 24, 'dinner',    'dinner — rice + fish or chicken + vegetables', 'Fish a week 2~3Sashimi, Meat aims to be served daily.', 220, 'early baby food', 3),
(13, 24, 'snack',     'morning snack — fruit + yogurt',      'Supplement your vitamins with fresh fruit.', 100, 'early baby food', 4),
(13, 24, 'snack',     'afternoon snack — milk + avocado/cheese', 'Replenish calories and calcium with an afternoon snack.', 130, 'early baby food', 5);

INSERT INTO meal_plan_foods (template_id, food_id, recommended_g, unit, notes) VALUES
-- morning
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='breakfast'), 16, 50, 'g', '1 egg (Boiled or Scrambled)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='breakfast'), 15, 80, 'g', 'white rice'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='breakfast'), 20,150,'ml', 'milk (400 per dayml Within)'),
-- lunch
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='lunch'), 15, 100, 'g', 'white rice'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='lunch'), 10,  50, 'g', 'beef (chopped, Cooked without seasoning)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='lunch'), 5,   40, 'g', 'broccoli'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='lunch'), 18,  30, 'g', 'spinach greens'),
-- dinner
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='dinner'), 15, 100, 'g', 'white rice'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='dinner'), 17,  50, 'g', 'salmon (bone removal, Well cooked)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='dinner'), 3,   40, 'g', 'sweet potato'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='dinner'), 11,  40, 'g', 'tofu (Cook gently)'),
-- morning snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='snack' AND sort_order=4), 7,  60, 'g', 'banana'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='snack' AND sort_order=4), 12, 80, 'g', 'plain yogurt'),
-- afternoon snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='snack' AND sort_order=5), 20,150,'ml','milk'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=13 AND meal_type='snack' AND sort_order=5), 25, 15, 'g', '1 piece of cheddar cheese');

-- ─── 25~47months: baby food/Reviews ─────────────────────────────────────────────
INSERT INTO meal_plan_templates (age_min_months, age_max_months, meal_type, title, description, total_kcal_approx, stage_label, sort_order) VALUES
(25, 47, 'breakfast', 'morning — egg + rice + vegetables + milk',  'The meal structure is almost the same as for adults.. Include at least one vegetable side dish.', 280, 'baby food', 1),
(25, 47, 'lunch',     'lunch — rice + meat side dish + 2 types of vegetables + soup', 'Boil the soup bland before serving.. Sodium 900 per daymg We aim to be within.', 350, 'baby food', 2),
(25, 47, 'dinner',    'dinner — rice + fish + vegetables + lentils', 'vegetable protein(lentils, tofu)Include a balanced.', 300, 'baby food', 3),
(25, 47, 'snack',     'morning snack — 2 types of fruits',             'Serve fresh seasonal fruits.', 90,  'baby food', 4),
(25, 47, 'snack',     'afternoon snack — milk + cheese or yogurt','Snack on dairy products for calcium intake.', 150, 'baby food', 5);

INSERT INTO meal_plan_foods (template_id, food_id, recommended_g, unit, notes) VALUES
-- morning
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='breakfast'), 16,  55, 'g', '1 egg'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='breakfast'), 15, 120, 'g', 'white rice'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='breakfast'), 18,  40, 'g', 'spinach greens'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='breakfast'), 20, 150,'ml','milk'),
-- lunch
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='lunch'), 15, 130, 'g', 'white rice'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='lunch'), 10,  60, 'g', 'beef (lean meat)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='lunch'), 5,   50, 'g', 'broccoli'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='lunch'), 4,   40, 'g', 'carrot'),
-- dinner
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='dinner'), 15, 130, 'g', 'white rice'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='dinner'), 17,  60, 'g', 'salmon'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='dinner'), 22,  50, 'g', 'lentils (boiled)'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='dinner'), 3,   50, 'g', 'sweet potato'),
-- morning snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='snack' AND sort_order=4), 6,  60, 'g', 'apple'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='snack' AND sort_order=4), 7,  50, 'g', 'banana'),
-- afternoon snack
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='snack' AND sort_order=5), 20,150,'ml','milk'),
((SELECT id FROM meal_plan_templates WHERE age_min_months=25 AND meal_type='snack' AND sort_order=5), 25, 15, 'g', 'cheese');
