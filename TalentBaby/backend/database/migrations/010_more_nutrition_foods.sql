-- Migration 010: Add more foods per nutrition category (10+ per category)

-- ─── Category 1: Carbohydrates ───────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(1, 'White Rice',       'Easily digestible staple grain, soft when overcooked for babies',               true,  '7-11,12-17,18-24,25-30,31-36', 20),
(1, 'Oat Porridge',     'Slow-release energy with beta-glucan fibre, great breakfast choice',            true,  '7-11,12-17,18-24,25-30,31-36', 21),
(1, 'Mashed Potato',    'Creamy, easy to swallow; rich in starch and potassium',                         true,  '7-11,12-17,18-24,25-30,31-36', 22),
(1, 'Corn',             'Natural sweetness and energy; serve as purée for younger babies',               true,  '7-11,12-17,18-24,25-30,31-36', 23),
(1, 'Whole-wheat Bread','Fibre-rich carb; suitable as finger food for older babies',                     true,  '12-17,18-24,25-30,31-36',      24);

-- ─── Category 2: Proteins ────────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(2, 'Tofu',             'Plant-based complete protein, soft texture ideal for babies',                   true,  '7-11,12-17,18-24,25-30,31-36', 20),
(2, 'Greek Yoghurt',    'High-protein dairy; also supplies calcium and probiotics',                      true,  '7-11,12-17,18-24,25-30,31-36', 21),
(2, 'Chickpeas',        'Legume rich in protein and fibre; mash or blend for easy eating',               true,  '12-17,18-24,25-30,31-36',      22),
(2, 'Tuna',             'Lean fish with complete amino acids; limit to 1-2x per week due to mercury',    false, '12-17,18-24,25-30,31-36',      23),
(2, 'Cottage Cheese',   'Mild, soft protein source; easy to mix into purees',                            true,  '7-11,12-17,18-24,25-30,31-36', 24);

-- ─── Category 3: Vitamin A ───────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(3, 'Butternut Squash', 'Sweet orange flesh full of beta-carotene; puree beautifully',                   true,  '7-11,12-17,18-24,25-30,31-36', 20),
(3, 'Red Bell Pepper',  'Bright colour, high beta-carotene and vitamin C; roast & blend',                true,  '7-11,12-17,18-24,25-30,31-36', 21),
(3, 'Papaya',           'Tropical fruit with beta-carotene; soft flesh easy for babies',                 true,  '7-11,12-17,18-24,25-30,31-36', 22),
(3, 'Eggs',             'Yolk contains vitamin A plus choline for brain development',                    true,  '7-11,12-17,18-24,25-30,31-36', 23),
(3, 'Liver (Chicken)',  'Extremely high in preformed vitamin A; offer in small amounts once a week',     false, '12-17,18-24,25-30,31-36',      24);

-- ─── Category 4: Vitamin B ───────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(4, 'Sunflower Seeds',  'B1 (thiamine) and B6 rich; grind finely for young babies',                     true,  '12-17,18-24,25-30,31-36',      20),
(4, 'Brown Rice',       'Contains B1, B3 and B6; more nutritious than white rice',                      true,  '7-11,12-17,18-24,25-30,31-36', 21),
(4, 'Peas',             'Good source of B1 and folate; blend smooth for young babies',                   true,  '7-11,12-17,18-24,25-30,31-36', 22),
(4, 'Pork (lean)',      'Excellent B1, B3 and B6 source; cook thoroughly and blend/shred',               false, '12-17,18-24,25-30,31-36',      23),
(4, 'Nutritional Yeast','Fortified with B vitamins including B12; sprinkle on food',                     true,  '12-17,18-24,25-30,31-36',      24);

-- ─── Category 5: Vitamin C ───────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(5, 'Mango',            'Sweet tropical fruit packed with vitamin C; mash or puree',                     true,  '7-11,12-17,18-24,25-30,31-36', 20),
(5, 'Pineapple',        'High vitamin C; blend to smooth puree or cut into small pieces',                true,  '12-17,18-24,25-30,31-36',      21),
(5, 'Cauliflower',      'Mild-flavoured cruciferous veg with good vitamin C; steam and mash',            true,  '7-11,12-17,18-24,25-30,31-36', 22),
(5, 'Tomato',           'Rich in vitamin C and lycopene; cook to reduce acidity for babies',             true,  '12-17,18-24,25-30,31-36',      23),
(5, 'Lychee',           'Very high vitamin C tropical fruit; remove seeds, blend or chop fine',         true,  '12-17,18-24,25-30,31-36',      24);

-- ─── Category 6: Vitamin D ───────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(6, 'Fortified Formula','Most infant formulas are fortified with vitamin D',                             true,  '0-6,7-11',                      20),
(6, 'Fortified Cereal', 'D3-fortified cereals; check label for infant-appropriate options',              true,  '7-11,12-17,18-24,25-30,31-36', 21),
(6, 'Trout',            'Freshwater fish with one of the highest natural vitamin D levels',              false, '12-17,18-24,25-30,31-36',      22),
(6, 'Cod Liver Oil',    'Concentrated vitamin D and A; use age-appropriate dose supplements',            false, '0-6,7-11,12-17,18-24',         23),
(6, 'Herring',          'Oily fish naturally rich in vitamin D; small flaked amounts',                   false, '12-17,18-24,25-30,31-36',      24),
(6, 'Portobello Mushroom','UV-exposed mushrooms produce vitamin D2; sauté and blend',                   true,  '12-17,18-24,25-30,31-36',      25);

-- ─── Category 7: Vitamin E ───────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(7, 'Almond Butter',    'Rich in vitamin E; spread thinly or mix into puree (introduce carefully)',      true,  '12-17,18-24,25-30,31-36',      20),
(7, 'Wheat Germ',       'Concentrated vitamin E; stir a teaspoon into cereal or porridge',               true,  '12-17,18-24,25-30,31-36',      21),
(7, 'Pine Nuts',        'Vitamin E and zinc-rich seeds; grind finely for young babies',                  true,  '12-17,18-24,25-30,31-36',      22),
(7, 'Broccoli',         'Contains vitamin E alongside K and C; steam and mash or blend',                 true,  '7-11,12-17,18-24,25-30,31-36', 23),
(7, 'Kiwi',             'Good vitamin E and C; remove seeds, mash or blend for infants',                 true,  '7-11,12-17,18-24,25-30,31-36', 24),
(7, 'Peanut Butter',    'High vitamin E; introduce in small amounts watching for allergy',               true,  '12-17,18-24,25-30,31-36',      25);

-- ─── Category 8: Calcium ─────────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(8, 'Cheddar Cheese',   'High calcium, easy to melt into food or serve as soft cubes',                  true,  '7-11,12-17,18-24,25-30,31-36', 20),
(8, 'White Beans',      'Plant-based calcium and protein; puree smooth for younger babies',              true,  '12-17,18-24,25-30,31-36',      21),
(8, 'Fortified Oat Milk','Good dairy-free calcium source; use in porridge from 12 months',              true,  '12-17,18-24,25-30,31-36',      22),
(8, 'Bok Choy',         'Dark leafy green with calcium; steam and blend with other veg',                 true,  '7-11,12-17,18-24,25-30,31-36', 23),
(8, 'Almonds (ground)', 'Calcium and healthy fats; always grind finely for safety',                     true,  '12-17,18-24,25-30,31-36',      24),
(8, 'Fortified Tofu',   'Calcium-set tofu is an excellent plant-based calcium source',                   true,  '7-11,12-17,18-24,25-30,31-36', 25);

-- ─── Category 9: Iron ────────────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(9, 'Fortified Infant Cereal','Iron-fortified rice or oat cereal; often the first solid food',          true,  '7-11,12-17',                   20),
(9, 'Dark Chocolate (>70%)','Contains iron; a small amount as a treat from 12 months',                  true,  '12-17,18-24,25-30,31-36',      21),
(9, 'Quinoa',           'Complete protein grain also rich in iron; soft when cooked well',               true,  '7-11,12-17,18-24,25-30,31-36', 22),
(9, 'Turkey (dark meat)','Good haem iron source; cook thoroughly and shred finely',                      false, '12-17,18-24,25-30,31-36',      23),
(9, 'Pumpkin Seeds',    'High iron seeds; grind into powder and add to purees',                          true,  '12-17,18-24,25-30,31-36',      24),
(9, 'Prunes',           'Iron-containing fruit that also helps with digestion; puree well',              true,  '7-11,12-17,18-24,25-30,31-36', 25);

-- ─── Category 10: Iodine ─────────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(10, 'Nori (seaweed)',   'Dried seaweed is very high in iodine; crumble tiny amounts on food',          true,  '12-17,18-24,25-30,31-36',      20),
(10, 'Shrimp / Prawns',  'Good iodine and protein; cook thoroughly, blend or chop fine',                false, '12-17,18-24,25-30,31-36',      21),
(10, 'Canned Tuna',      'Convenient iodine source; low-sodium variety, limit frequency',               false, '12-17,18-24,25-30,31-36',      22),
(10, 'Fortified Salt',   'Iodised table salt; use tiny amounts only in family cooking from 12m',        true,  '12-17,18-24,25-30,31-36',      23),
(10, 'Mozzarella',       'Dairy with moderate iodine; soft texture safe for babies',                    true,  '7-11,12-17,18-24,25-30,31-36', 24),
(10, 'Cranberries',      'Moderate iodine fruit; mix into yoghurt or cereals',                          true,  '12-17,18-24,25-30,31-36',      25),
(10, 'Strawberries',     'Low-calorie fruit with iodine; mash or slice for finger food',                true,  '7-11,12-17,18-24,25-30,31-36', 26);

-- ─── Category 11: Folate ─────────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(11, 'Black-eyed Peas',  'Very high folate legume; cook soft and puree or mash',                        true,  '12-17,18-24,25-30,31-36',      20),
(11, 'Edamame',          'Young soy beans rich in folate; steam, remove skins and blend',               true,  '7-11,12-17,18-24,25-30,31-36', 21),
(11, 'Romaine Lettuce',  'Leafy green with folate; blend into green purees with other veg',              true,  '7-11,12-17,18-24,25-30,31-36', 22),
(11, 'Beetroot',         'Folate-rich root veg with vibrant colour; steam and blend',                    true,  '7-11,12-17,18-24,25-30,31-36', 23),
(11, 'Mango',            'Tropical fruit with folate and vitamin C; puree or soft pieces',              true,  '7-11,12-17,18-24,25-30,31-36', 24),
(11, 'Wheat Germ',       'Concentrated folate; mix into porridge or yoghurt',                            true,  '12-17,18-24,25-30,31-36',      25);

-- ─── Category 12: DHA & ARA ──────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(12, 'Mackerel',         'Oily fish very high in DHA; steam and flake removing all bones',              false, '12-17,18-24,25-30,31-36',      20),
(12, 'Trout',            'Freshwater fish with good DHA profile; gentle flavour babies like',           false, '12-17,18-24,25-30,31-36',      21),
(12, 'Fortified Formula','Infant formula fortified with DHA and ARA for brain development',             true,  '0-6,7-11',                      22),
(12, 'Algae Oil',        'Plant-based DHA from microalgae; available as infant supplement drops',       true,  '0-6,7-11,12-17',               23),
(12, 'Fortified Eggs',   'Eggs from hens fed DHA-rich diet contain higher omega-3',                     true,  '7-11,12-17,18-24,25-30,31-36', 24),
(12, 'Hemp Seeds',       'Plant-based ALA omega-3; grind and sprinkle on food',                         true,  '12-17,18-24,25-30,31-36',      25);

-- ─── Category 13: Zinc ───────────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(13, 'Lamb',             'Very high in zinc; cook until tender and blend or shred finely',              false, '12-17,18-24,25-30,31-36',      20),
(13, 'Crab',             'Shellfish high in zinc; cook well and flake carefully (watch allergens)',     false, '12-17,18-24,25-30,31-36',      21),
(13, 'Cashews (ground)', 'Plant-based zinc; grind finely or use as nut butter',                         true,  '12-17,18-24,25-30,31-36',      22),
(13, 'Oats',             'Modest zinc with beta-glucan fibre; a good everyday zinc source',             true,  '7-11,12-17,18-24,25-30,31-36', 23),
(13, 'Fortified Cereal', 'Many breakfast cereals are zinc-fortified; check infant options',             true,  '7-11,12-17,18-24,25-30,31-36', 24),
(13, 'Dark Meat Chicken','Darker chicken pieces have more zinc than breast meat',                       false, '12-17,18-24,25-30,31-36',      25),
(13, 'Sesame Seeds',     'Zinc-rich seeds; use as tahini paste mixed into food',                        true,  '12-17,18-24,25-30,31-36',      26);

-- ─── Category 14: Vitamin B12 ────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(14, 'Fortified Soy Milk','Plant-based B12-fortified drink; use in cooking from 12 months',            true,  '12-17,18-24,25-30,31-36',      20),
(14, 'Canned Sardines',   'Oily fish with B12; blend with mashed potato for easy eating',              false, '12-17,18-24,25-30,31-36',      21),
(14, 'Fortified Yeast Extract','Marmite-style spreads; tiny amounts, very high in B12 and salt',      true,  '12-17,18-24,25-30,31-36',      22),
(14, 'Trout',             'Good B12 alongside DHA; cook soft and flake well',                          false, '12-17,18-24,25-30,31-36',      23),
(14, 'Nutritional Yeast', 'Fortified with B12; nutty flavour to sprinkle on food',                     true,  '12-17,18-24,25-30,31-36',      24),
(14, 'Milk (whole)',      'Everyday B12 source from dairy; offer in cups from 12 months',              true,  '12-17,18-24,25-30,31-36',      25),
(14, 'Tempeh',            'Fermented soy product with B12; mash or slice for finger food',             true,  '12-17,18-24,25-30,31-36',      26);

-- ─── Category 15: Potassium ──────────────────────────────────────────────────
INSERT INTO nutrition_foods (category_id, name, description, is_vegetarian, age_groups, sort_order) VALUES
(15, 'Banana',            'Soft, sweet, high-potassium fruit; perfect finger food from 7 months',      true,  '7-11,12-17,18-24,25-30,31-36', 20),
(15, 'Avocado',           'Creamy, high-potassium and healthy fat; mash onto toast or in puree',       true,  '7-11,12-17,18-24,25-30,31-36', 21),
(15, 'Acorn Squash',      'Winter squash high in potassium; roast and scoop flesh',                    true,  '7-11,12-17,18-24,25-30,31-36', 22),
(15, 'Cantaloupe',        'Melon rich in potassium and beta-carotene; soft, easy to eat',              true,  '7-11,12-17,18-24,25-30,31-36', 23),
(15, 'Pomegranate',       'Antioxidant-rich with potassium; mix juice/seeds into yoghurt',             true,  '12-17,18-24,25-30,31-36',      24),
(15, 'Coconut Water',     'Natural electrolyte drink with potassium; plain, no added sugar',           true,  '12-17,18-24,25-30,31-36',      25),
(15, 'Salmon',            'Omega-3 fish also high in potassium; bake and flake finely',                false, '12-17,18-24,25-30,31-36',      26);
