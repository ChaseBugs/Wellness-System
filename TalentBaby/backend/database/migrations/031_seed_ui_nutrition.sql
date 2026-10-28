-- Migration 031: Seed nutrition content from ui/babyG/nutritions screenshots.
-- Source folders cover 0-6 lactation guidance, 7-11 detailed recipes,
-- and 12-36 recipe/nutrition-benefit list screens.

UPDATE nutrition_categories
SET description = CASE name
  WHEN 'Carbohydrates' THEN 'Supply food energy for growth, body functions, and activity; allow protein and fats in the diet to be used efficiently.'
  WHEN 'Proteins' THEN 'Support growth, tissue repair, muscle development, enzyme production, and immune function.'
  WHEN 'Vitamin A' THEN 'Supports vision, immune defenses, skin health, and normal growth.'
  WHEN 'Vitamin B' THEN 'Supports energy metabolism, appetite, nervous-system function, and brain development.'
  WHEN 'Vitamin C' THEN 'Supports immunity, healthy gums, wound healing, and iron absorption.'
  WHEN 'Vitamin D' THEN 'Helps the body absorb calcium and supports strong bones and teeth.'
  WHEN 'Vitamin E' THEN 'Acts as an antioxidant and helps protect developing cells.'
  WHEN 'Calcium' THEN 'Builds strong bones and teeth and supports muscle and nerve function.'
  WHEN 'Iron' THEN 'Supports red blood cells, oxygen transport, and brain development.'
  WHEN 'Iodine' THEN 'Supports thyroid hormone production and healthy brain development.'
  WHEN 'Folate' THEN 'Supports cell growth, DNA synthesis, and healthy blood formation.'
  WHEN 'DHA & ARA' THEN 'Omega fatty acids that support brain and eye development.'
  WHEN 'Zinc' THEN 'Supports growth, immune function, wound healing, and appetite.'
  WHEN 'Vitamin B12' THEN 'Supports nerve function, red blood cell formation, and brain development.'
  WHEN 'Potassium' THEN 'Supports fluid balance, muscle function, and normal heart rhythm.'
  ELSE description
END
WHERE language = 'en';

INSERT INTO nutrition_guides (
  title,
  description,
  trimester,
  content,
  meal_suggestions,
  recipes,
  image_url,
  language
)
SELECT
  'Tips for Breastfeeding Moms',
  'Lactation guide for months 0-6 from the Nutrition & Recipes UI.',
  0,
  'Breastfeeding offers a special bond and nourishment for your baby, providing essential nutrients and immune protection. Helpful lactation guidance includes staying hydrated, choosing whole grains like oats and barley, including lean proteins, eating seasonal fruits and vegetables, using lactation-friendly foods such as almonds, sesame seeds, brewer''s yeast, papaya, apricots, and carrots, and limiting excessive carbonated drinks, caffeine, and alcohol. Consult a clinician for personalized feeding or supply concerns.',
  ARRAY[
    'Cereals: oatmeal, barley, quinoa, brown rice, millet',
    'Milk products: Greek yogurt, cottage cheese, almond milk, cashew milk, goat milk',
    'Vegetables: spinach, sweet potatoes, carrots, beet greens, asparagus',
    'Fruits: blueberries, papaya, dates, fennel, apricots',
    'Nuts and oilseeds: almonds, sesame seeds, flaxseeds, fenugreek seeds, chia seeds',
    'Spices and condiments: cumin, ginger, turmeric, garlic, cinnamon',
    'Meat and eggs: brown eggs, lean beef, chicken, turkey'
  ],
  ARRAY[
    'Oatmeal Banana Pancakes',
    'Barley Vegetable Soup',
    'Quinoa Veggie Bowl',
    'Brown Rice Stir-Fry',
    'Millet Salad',
    'Yogurt Parfait',
    'Cottage Cheese Pancakes',
    'Almond Milk Smoothie',
    'Cashew Milk Chia Pudding',
    'Spinach and Feta Stuffed Chicken Breast',
    'Sweet Potato and Black Bean Burrito Bowl',
    'Carrot Ginger Soup',
    'Blueberry Chia Seed Pudding',
    'Papaya Coconut Smoothie',
    'Date Energy Balls',
    'Almond Energy Balls',
    'Flaxseed Smoothie',
    'Ginger Turmeric Tea',
    'Cinnamon Apple Overnight Oats'
  ],
  NULL,
  'en'
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition_guides
  WHERE title = 'Tips for Breastfeeding Moms' AND language = 'en'
);

WITH recipe_seed AS (
  SELECT * FROM jsonb_to_recordset($$[
    {"title":"Blueberry Quinoa","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Fiber","Vitamin C","Vitamin K","Magnesium","Potassium","Iron","Folate"]},
    {"title":"Banana Pancakes","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Potassium","Protein","Iron"]},
    {"title":"Power Toast with Fruit","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Carbohydrates","Vitamin C","Healthy fats"]},
    {"title":"Cinnamon Apple Pancakes","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":15,"nutrients":["Fiber","Carbohydrates"]},
    {"title":"Baby Omelette","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Vitamin B12","Iron"]},
    {"title":"Peanut Butter Toast","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Protein","Healthy fats"]},
    {"title":"Scrambled Eggs","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Vitamin D","Vitamin B12"]},
    {"title":"Avocado Toast with Banana","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Potassium","Healthy fats","Fiber"]},
    {"title":"Cottage Cheese Toast","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Protein","Calcium"]},
    {"title":"Strawberry French Toast","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":15,"nutrients":["Vitamin C","Protein","Carbohydrates"]},
    {"title":"Almond Butter Toast","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Vitamin E","Healthy fats","Protein"]},
    {"title":"Orange Cream Cheese Toast","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Vitamin C","Calcium"]},
    {"title":"French Toast with Mashed Blackberries","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":20,"nutrients":["Fiber","Vitamin C","Protein"]},
    {"title":"Waffle with Blueberries","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Carbohydrates","Vitamin C"]},
    {"title":"Toast with Smoothie","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Carbohydrates","Vitamin C","Calcium"]},
    {"title":"Avocado Toast & Berry Smoothie","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Healthy fats","Vitamin C","Fiber"]},
    {"title":"Egg Muffins","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":30,"nutrients":["Protein","Iron","Vitamin B12"]},
    {"title":"Chicken Pepper Egg Muffins","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":30,"nutrients":["Protein","Iron","Vitamin C"]},
    {"title":"Savory Egg Muffins","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":30,"nutrients":["Protein","Vitamin B12"]},
    {"title":"Almond Toast with Smoothie","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":15,"nutrients":["Vitamin E","Calcium","Vitamin C"]},
    {"title":"PB Banana Sandwich","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Potassium","Healthy fats"]},
    {"title":"Butter Toast with Smoothie","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Carbohydrates","Calcium"]},
    {"title":"Protein Packed Breakfast","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":40,"nutrients":["Protein","Iron"]},
    {"title":"Pumpkin Toast with Smoothie","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Vitamin A","Fiber","Calcium"]},
    {"title":"Waffle with Raspberry","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Vitamin C","Fiber"]},
    {"title":"Peach Oatmeal","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Fiber","Carbohydrates"]},
    {"title":"Mango Chia Pudding","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Vitamin A","DHA & ARA","Fiber"]},
    {"title":"Pear Oatmeal","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":15,"nutrients":["Fiber","Carbohydrates"]},
    {"title":"Raspberry Oatmeal","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Fiber","Vitamin C"]},
    {"title":"Iron Almond Cereal","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Iron","Vitamin E"]},
    {"title":"Iron Banana Cereal","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Iron","Potassium"]},
    {"title":"Omelette Strips with Grapefruit","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Vitamin C"]},
    {"title":"Iron Strawberry Cereal","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":5,"nutrients":["Iron","Vitamin C"]},
    {"title":"Turkey Veggie Frittata","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"breakfast","prep":20,"nutrients":["Protein","Iron","Vitamin A"]},

    {"title":"Steak Strips & Raspberries","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":10,"nutrients":["Iron","Protein","Vitamin C"]},
    {"title":"Sweet Potato Spears","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":10,"nutrients":["Vitamin A","Potassium","Fiber"]},
    {"title":"Black Bean Mash Zucchini Spears","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":15,"nutrients":["Protein","Fiber","Iron"]},
    {"title":"Veggie Mash","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":15,"nutrients":["Vitamin A","Fiber","Potassium"]},
    {"title":"Quinoa Bowl","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":15,"nutrients":["Iron","Protein","Magnesium"]},
    {"title":"Sweet Potato Latkes","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":15,"nutrients":["Vitamin A","Carbohydrates"]},
    {"title":"Flax & Cheese Beetroot Carrots","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":10,"nutrients":["DHA & ARA","Calcium","Vitamin A"]},
    {"title":"Breakfast Fritters","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":30,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Cheese Sandwich with Tomato Soup","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":15,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Cheesy Mushroom Quesadilla","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":30,"nutrients":["Calcium","Vitamin D"]},
    {"title":"Naan Chickpea Spears","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":30,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Cheddar Broccoli Soup","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":20,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Egg Salad Pinwheel & Kiwi","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":15,"nutrients":["Protein","Vitamin C","Vitamin B12"]},
    {"title":"Pesto Pasta with Kiwi","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":10,"nutrients":["Carbohydrates","Vitamin C"]},
    {"title":"Broccoli Pasta Salad","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":20,"nutrients":["Vitamin C","Carbohydrates"]},
    {"title":"Pork with Apple Sauce","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":20,"nutrients":["Protein","Iron"]},
    {"title":"Italian Risotto","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"lunch","prep":25,"nutrients":["Carbohydrates","Calcium"]},

    {"title":"Pasta Bolognese","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":20,"nutrients":["Iron","Protein","Carbohydrates"]},
    {"title":"Salmon with Zucchini Spears","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":20,"nutrients":["DHA & ARA","Protein","Vitamin D"]},
    {"title":"Meat Sauce Pasta","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":20,"nutrients":["Iron","Protein"]},
    {"title":"Roasted Chicken with Cannellini Beans","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":40,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Chicken Chili","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":45,"nutrients":["Protein","Iron"]},
    {"title":"Turkey Tomato Pasta","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":30,"nutrients":["Protein","Vitamin C"]},
    {"title":"White Fish with Caprese Salad","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":20,"nutrients":["Protein","Iodine","Calcium"]},
    {"title":"Salmon Mash with Cauliflower","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":20,"nutrients":["DHA & ARA","Vitamin C"]},
    {"title":"Steak with Mashed Potatoes","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":20,"nutrients":["Iron","Protein","Potassium"]},
    {"title":"Cajun Fish","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":30,"nutrients":["Protein","Iodine","Vitamin D"]},
    {"title":"Ginger Garlic Tofu","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":15,"nutrients":["Protein","Calcium"]},
    {"title":"Lentil and Veggie Stew","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":30,"nutrients":["Iron","Protein","Fiber"]},
    {"title":"Veggie Burger","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":30,"nutrients":["Protein","Fiber"]},
    {"title":"Spinach Ricotta Beef Meatballs","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":30,"nutrients":["Iron","Protein","Calcium"]},
    {"title":"Chicken Noodle Soup","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":25,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Acorn Squash Pasta","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":25,"nutrients":["Vitamin A","Carbohydrates"]},
    {"title":"Sesame Tofu Broccoli","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"dinner","prep":25,"nutrients":["Calcium","Protein","Vitamin C"]},

    {"title":"Power Bananas","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Potassium","Carbohydrates"]},
    {"title":"Salmon Smash","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":30,"nutrients":["DHA & ARA","Protein"]},
    {"title":"Veggie Fritters","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":15,"nutrients":["Fiber","Vitamin A"]},
    {"title":"Raspberry Yogurt Delight","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Avocado Hemp Spears","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Healthy fats","DHA & ARA"]},
    {"title":"Yogurt with Fruit","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Homemade Oatmeal Cookies","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":20,"nutrients":["Fiber","Carbohydrates"]},
    {"title":"Hummus with Broccoli","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":10,"nutrients":["Protein","Vitamin C","Fiber"]},
    {"title":"Coconut Mango Spears","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Vitamin A","Healthy fats"]},
    {"title":"Cashew Cracker Crunch","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Protein","Healthy fats"]},
    {"title":"Cheesy Cracker Duo","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Flax Avocado Spear","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":10,"nutrients":["DHA & ARA","Healthy fats"]},
    {"title":"Blueberry Muffin with Banana Spear","age_group":"7-11","min_m":7,"max_m":11,"meal_slot":"snack","prep":20,"nutrients":["Potassium","Vitamin C"]},

    {"title":"Mixed Fruit Yogurt","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Fluffy Banana Spinach Pancakes","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":15,"nutrients":["Iron","Potassium"]},
    {"title":"Spinach Banana Pancakes","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":15,"nutrients":["Iron","Potassium"]},
    {"title":"Pear Waffle Dippers with Yogurt","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":10,"nutrients":["Calcium","Fiber"]},
    {"title":"French Fruit Nutty Crepes","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":20,"nutrients":["Vitamin C","Protein"]},
    {"title":"Pistachio Pear Ricotta Toast","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":10,"nutrients":["Calcium","Fiber","Healthy fats"]},
    {"title":"Cinnamon Apple Puree","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":10,"nutrients":["Fiber","Vitamin C"]},
    {"title":"Berry-licious Muffin","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":25,"nutrients":["Vitamin C","Carbohydrates"]},
    {"title":"Frittata","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":20,"nutrients":["Protein","Vitamin B12"]},
    {"title":"Cheesy Scrambled Egg","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Calcium"]},
    {"title":"Cinnamon Waffles","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":15,"nutrients":["Carbohydrates"]},
    {"title":"Parfait","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Cheesy Kiwi Delight","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Dino Pancakes","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"breakfast","prep":15,"nutrients":["Protein","Carbohydrates"]},

    {"title":"Veggie Quesadilla","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":15,"nutrients":["Calcium","Fiber"]},
    {"title":"Turkey with Baked Fries","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":25,"nutrients":["Protein","Iron","Potassium"]},
    {"title":"Pistachio Pear Ricotta Spears","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":10,"nutrients":["Calcium","Fiber"]},
    {"title":"Black Bean Bites with Savory Dip","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Vegetable Lentil Bell Pepper Medley","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":25,"nutrients":["Iron","Vitamin C","Protein"]},
    {"title":"Artichoke Tomato Pasta","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":20,"nutrients":["Carbohydrates","Fiber","Vitamin C"]},
    {"title":"Thai Peanut Tofu Bowl","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":20,"nutrients":["Protein","Calcium","Healthy fats"]},
    {"title":"Veggie Tzatziki","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"snack","prep":10,"nutrients":["Calcium","Fiber"]},
    {"title":"Egg Salad Pinwheels","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":15,"nutrients":["Protein","Vitamin B12"]},
    {"title":"Tomato Sandwich Soup","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"lunch","prep":20,"nutrients":["Vitamin C","Calcium"]},

    {"title":"Dill Salmon with Cauliflower","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":20,"nutrients":["DHA & ARA","Protein","Vitamin C"]},
    {"title":"Beef & Rice Stuffed Pepper","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":30,"nutrients":["Iron","Protein","Vitamin C"]},
    {"title":"Chicken Rice","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":25,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Salmon Patty","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":20,"nutrients":["DHA & ARA","Protein"]},
    {"title":"Stuffed Bell Peppers","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":30,"nutrients":["Vitamin C","Iron"]},
    {"title":"Beef Sliders","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":25,"nutrients":["Iron","Protein"]},
    {"title":"Deconstructed Taco","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Bean Chili with Corn Bread","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":30,"nutrients":["Protein","Fiber","Iron"]},
    {"title":"Savory Steak","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":20,"nutrients":["Iron","Protein"]},
    {"title":"Mushroom Stuffed Shell","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":30,"nutrients":["Vitamin D","Carbohydrates"]},
    {"title":"Lemon Chicken Orzo","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":25,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Cod Burger","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"dinner","prep":25,"nutrients":["Protein","Iodine"]},

    {"title":"Banana with Chocolate Peanut Butter","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"snack","prep":5,"nutrients":["Potassium","Protein","Healthy fats"]},
    {"title":"Cheese and Crackers","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Green Smoothie","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"snack","prep":5,"nutrients":["Vitamin A","Vitamin C","Calcium"]},
    {"title":"Veggies and Hummus","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber"]},
    {"title":"Graham Crackers","age_group":"12-17","min_m":12,"max_m":17,"meal_slot":"snack","prep":5,"nutrients":["Carbohydrates"]},

    {"title":"Cheesy Kiwi Delight","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"breakfast","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Dino Pancakes","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"breakfast","prep":15,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Pumpkin Overnight Oats","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"lunch","prep":10,"nutrients":["Vitamin A","Fiber"]},
    {"title":"Deconstructed Taco With Chicken","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"lunch","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Honey Ginger Tofu Stir Fry","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"dinner","prep":20,"nutrients":["Protein","Calcium"]},
    {"title":"Baked Ziti","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"dinner","prep":30,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Pumpkin Pasta","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"dinner","prep":25,"nutrients":["Vitamin A","Carbohydrates"]},
    {"title":"Deconstructed Taco With Chicken","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"dinner","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Chocolate Chia Pudding","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":5,"nutrients":["DHA & ARA","Fiber"]},
    {"title":"Banana Muffin With Almond","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":20,"nutrients":["Potassium","Vitamin E"]},
    {"title":"Banana With Almond Butter","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":5,"nutrients":["Potassium","Healthy fats"]},
    {"title":"Cheesy Kiwi Delight","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Choco Berry Chia Pudding","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":5,"nutrients":["Fiber","Vitamin C","DHA & ARA"]},
    {"title":"Crackers With Feta Dip","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Dino Pancakes","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":15,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Veggies With Hummus","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber"]},
    {"title":"Yogurt With Fruit & Crushed Nuts","age_group":"18-24","min_m":18,"max_m":24,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C","Healthy fats"]},

    {"title":"Cheesy Kiwi Delight","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"breakfast","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Dino Pancakes","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"breakfast","prep":15,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Waffle Strips With Yogurt & Fruit","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"breakfast","prep":10,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Boiled Egg + Oat Bar","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Fiber","Vitamin B12"]},
    {"title":"Nut Butter Overnight Oats","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"lunch","prep":10,"nutrients":["Fiber","Protein","Healthy fats"]},
    {"title":"Pumpkin Overnight Oats","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"lunch","prep":10,"nutrients":["Vitamin A","Fiber"]},
    {"title":"Deconstructed Taco With Chicken","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"lunch","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Cheese Quesadilla","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"lunch","prep":15,"nutrients":["Calcium","Protein"]},
    {"title":"Nut Butter Overnight Oats","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"dinner","prep":10,"nutrients":["Fiber","Protein","Healthy fats"]},
    {"title":"Pumpkin Overnight Oats","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"dinner","prep":10,"nutrients":["Vitamin A","Fiber"]},
    {"title":"Deconstructed Taco With Chicken","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"dinner","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Cheese Quesadilla","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"dinner","prep":15,"nutrients":["Calcium","Protein"]},
    {"title":"Crackers with Avocado","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":5,"nutrients":["Healthy fats","Carbohydrates"]},
    {"title":"Chocolate Chia Pudding","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":5,"nutrients":["DHA & ARA","Fiber"]},
    {"title":"Banana Muffin With Almond","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":20,"nutrients":["Potassium","Vitamin E"]},
    {"title":"Banana With Almond Butter","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":5,"nutrients":["Potassium","Healthy fats"]},
    {"title":"Cinnamon Oats With Raspberry","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":10,"nutrients":["Fiber","Vitamin C"]},
    {"title":"Crackers With Feta Dip","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Crackers & Cheese","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Veggies With Hummus","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber"]},
    {"title":"Chocolate Chip Energy Bites","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":10,"nutrients":["Carbohydrates","Healthy fats"]},
    {"title":"Mixed Veggies With Hummus","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber","Vitamin C"]},
    {"title":"Oat Bar With Kiwi","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":10,"nutrients":["Fiber","Vitamin C"]},
    {"title":"Yogurt With Fruit & Crushed Nuts","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C","Healthy fats"]},
    {"title":"Orange Tofu","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":15,"nutrients":["Protein","Calcium","Vitamin C"]},
    {"title":"Boiled Egg + Oat Bar","age_group":"25-30","min_m":25,"max_m":30,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber","Vitamin B12"]},

    {"title":"Cheesy Kiwi Delight","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"breakfast","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Dino Pancakes","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"breakfast","prep":15,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Waffle Strips With Yogurt & Fruit","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"breakfast","prep":10,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Boiled Egg + Oat Bar","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"breakfast","prep":10,"nutrients":["Protein","Fiber","Vitamin B12"]},
    {"title":"Nut Butter Overnight Oats","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"lunch","prep":10,"nutrients":["Fiber","Protein","Healthy fats"]},
    {"title":"Pumpkin Overnight Oats","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"lunch","prep":10,"nutrients":["Vitamin A","Fiber"]},
    {"title":"Deconstructed Taco With Chicken","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"lunch","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Cheese Quesadilla","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"lunch","prep":15,"nutrients":["Calcium","Protein"]},
    {"title":"Nut Butter Overnight Oats","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"dinner","prep":10,"nutrients":["Fiber","Protein","Healthy fats"]},
    {"title":"Pumpkin Overnight Oats","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"dinner","prep":10,"nutrients":["Vitamin A","Fiber"]},
    {"title":"Deconstructed Taco With Chicken","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"dinner","prep":20,"nutrients":["Protein","Iron","Fiber"]},
    {"title":"Cheese Quesadilla","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"dinner","prep":15,"nutrients":["Calcium","Protein"]},
    {"title":"Chocolate Chia Pudding","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["DHA & ARA","Fiber"]},
    {"title":"Banana Muffin With Almond","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":20,"nutrients":["Potassium","Vitamin E"]},
    {"title":"Banana With Almond Butter","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["Potassium","Healthy fats"]},
    {"title":"Cheesy Kiwi Delight","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C"]},
    {"title":"Choco Berry Chia Pudding","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["Fiber","Vitamin C","DHA & ARA"]},
    {"title":"Crackers With Feta Dip","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Crackers & Cheese","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Carbohydrates"]},
    {"title":"Dino Pancakes","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":15,"nutrients":["Protein","Carbohydrates"]},
    {"title":"Mixed Veggies With Hummus","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber","Vitamin C"]},
    {"title":"Oat Bar With Kiwi","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":10,"nutrients":["Fiber","Vitamin C"]},
    {"title":"Yogurt With Fruit & Crushed Nuts","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":5,"nutrients":["Calcium","Vitamin C","Healthy fats"]},
    {"title":"Orange Tofu","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":15,"nutrients":["Protein","Calcium","Vitamin C"]},
    {"title":"Boiled Egg + Oat Bar","age_group":"31-36","min_m":31,"max_m":36,"meal_slot":"snack","prep":10,"nutrients":["Protein","Fiber","Vitamin B12"]}
  ]$$::jsonb) AS r(title text, age_group text, min_m int, max_m int, meal_slot text, prep int, nutrients text[])
)
INSERT INTO recipes (
  title,
  description,
  target,
  meal_slot,
  baby_age_group,
  age_range_min_months,
  age_range_max_months,
  recipe_type,
  ingredients,
  instructions,
  nutrition_info,
  prep_time_minutes,
  cooking_time_minutes,
  image_url,
  language
)
SELECT
  title,
  'UI-derived baby recipe for months ' || age_group || '. Prepare as a soft, age-appropriate texture and adjust thickness for the child''s feeding skills.',
  'baby',
  meal_slot,
  age_group,
  min_m,
  max_m,
  CASE meal_slot WHEN 'snack' THEN 'snack' WHEN 'breakfast' THEN 'meal' ELSE 'meal' END,
  ARRAY[
    title,
    'Breast milk, formula, water, yogurt, or unsalted broth as needed for texture',
    'Soft cooked fruits, vegetables, grains, proteins, or dairy suggested by the recipe name'
  ],
  ARRAY[
    'Wash hands and prepare ingredients in a clean kitchen.',
    'Cook grains, eggs, meat, fish, tofu, or vegetables thoroughly when used.',
    'Mash, mince, shred, cut into safe strips, or puree to an age-appropriate texture.',
    'Cool before serving and supervise the child while eating.',
    'Introduce common allergens only as appropriate for the child and family guidance.'
  ],
  jsonb_build_object(
    'nutrients', nutrients,
    'source', 'ui/babyG/nutritions',
    'source_age_group', age_group,
    'safety_notes', ARRAY[
      'Avoid honey before 12 months.',
      'Avoid hard, round, sticky, or large pieces that can be choking hazards.',
      'Consult the child''s clinician for allergies, feeding delays, or medical nutrition needs.'
    ]
  ),
  prep,
  NULL,
  NULL,
  'en'
FROM recipe_seed r
WHERE NOT EXISTS (
  SELECT 1
  FROM recipes existing
  WHERE existing.title = r.title
    AND existing.target = 'baby'
    AND existing.baby_age_group = r.age_group
    AND existing.meal_slot = r.meal_slot
    AND existing.language = 'en'
);

UPDATE recipes
SET image_url = NULL
WHERE nutrition_info->>'source' = 'ui/babyG/nutritions'
  AND image_url LIKE '/images/nutrition/recipes/%';

UPDATE nutrition_guides
SET image_url = NULL
WHERE title = 'Tips for Breastfeeding Moms'
  AND language = 'en'
  AND image_url = '/images/nutrition/lactation-guide.png';
