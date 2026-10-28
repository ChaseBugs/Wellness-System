require('dotenv').config();

const { Client } = require('pg');

const INSTRUCTION_NOTES = [
  'Start with small portions and build gradually as baby learns to feed.',
  'Adjust thickness and texture to match the baby\'s feeding skills.',
  'Always test the temperature of food before serving.',
  'Do not add honey, sugar, sweeteners, or extra salt for baby meals.',
];

const GENERAL_NOTES = [
  'Monitor hunger and fullness cues and adjust feeding accordingly.',
  'Avoid force-feeding and keep mealtimes calm and pressure-free.',
  'Make sure food has cooled to a safe temperature before serving.',
  'Stay alert for choking risks and serve soft, mashable pieces.',
  'Consult the child\'s primary doctor for allergies, medical nutrition needs, or feeding concerns.',
  'For highly allergenic foods, follow the family clinician\'s guidance before introduction.',
];

const MATERIAL_IMAGE = '/images/nutrition/materials/';

const INGREDIENT_IMAGE_RULES = [
  [/breast milk|formula/i, 'breast-milk-formula.png'],
  [/quinoa/i, 'quinoa.png'],
  [/oat|cereal|flour|toast|bread|waffle|pancake|pasta|noodle|rice|grain|cracker|tortilla|naan/i, 'whole-grains.png'],
  [/blueberry|blackberr|raspberr|strawberry|berry|banana|peach|pear|fruit|apple|plum/i, 'fruits.png'],
  [/mango/i, 'mango.png'],
  [/kiwi/i, 'kiwi.png'],
  [/orange|grapefruit|citrus/i, 'orange.png'],
  [/avocado/i, 'avocado.png'],
  [/almond butter|almond/i, 'almond-butter.png'],
  [/peanut|cashew|nut butter|walnut/i, 'walnuts.png'],
  [/hemp|chia|flax|seed/i, 'seeds-like-sesame.png'],
  [/egg|omelette|frittata|muffin/i, 'eggs.png'],
  [/cheese|cheddar|ricotta|cottage|yogurt|cream cheese|dairy/i, 'cheese.png'],
  [/chicken/i, 'chicken.png'],
  [/turkey|beef|steak|pork|meat|bolognese|meatball/i, 'liver.png'],
  [/salmon/i, 'salmon.png'],
  [/\bfish\b|white fish|cajun fish/i, 'fish.png'],
  [/tofu|soy/i, 'soybean.png'],
  [/lentil|bean|chickpea|hummus|legume/i, 'pulses-and-legumes.png'],
  [/sweet potato|potato/i, 'potato.png'],
  [/pumpkin|squash/i, 'pumpkin.png'],
  [/zucchini|broccoli|cauliflower|vegetable|veggie/i, 'fruits-and-vegetables.png'],
  [/mushroom/i, 'portobello-mushroom.png'],
  [/tomato|caprese/i, 'tomato.png'],
  [/carrot/i, 'carrot.png'],
  [/beet/i, 'fruits-and-vegetables.png'],
  [/milk/i, 'milk.png'],
];

const TITLE_OVERRIDES = {
  'Blueberry Quinoa': {
    ingredients: [
      'Iron-fortified infant quinoa cereal (2-4 tbsp)',
      'Mashed blueberries (2 tbsp)',
      'Breast milk or formula (4+ oz)',
    ],
    steps: [
      'Mash blueberries until smooth.',
      'Mix the iron-fortified quinoa cereal with the mashed blueberries.',
      'Gradually add breast milk or formula, stirring until the mixture reaches a smooth consistency.',
    ],
  },
  'Banana Pancakes': {
    ingredients: [
      'Ripe banana (1)',
      'Egg (1)',
      'Whole wheat or all-purpose flour (1/4 cup)',
      'Breast milk or formula (1/4 cup)',
      'Plain whole-milk yogurt for dipping',
    ],
    steps: [
      'Mash the banana in a bowl.',
      'Add the egg and whisk together.',
      'Slowly add flour and breast milk or formula until a soft batter forms.',
      'Cook small pancakes on a lightly greased pan until set on both sides.',
      'Cool and cut into baby-safe strips; serve with plain yogurt for dipping.',
    ],
  },
  'Steak Strips & Raspberries': {
    ingredients: [
      'Beef flank steak or ribeye, cooked and cut into thin finger-like strips',
      'Raspberries (1/4 cup), mashed or flattened',
    ],
    steps: [
      'Cut the steak into thin finger-like strips.',
      'Cook the steak strips thoroughly in a skillet until safe for baby.',
      'Let the steak rest, then cut or shred into baby-safe pieces as needed.',
      'Mash or flatten raspberries and serve alongside the steak.',
    ],
  },
};

const INGREDIENT_RULES = [
  [/blueberry|blackberr|raspberr|strawberry|berry/i, 'Mashed soft berries'],
  [/banana/i, 'Ripe banana'],
  [/apple/i, 'Unsweetened apple sauce or soft cooked apple'],
  [/peach/i, 'Soft ripe peach or peach puree'],
  [/pear/i, 'Soft ripe pear or pear puree'],
  [/kiwi/i, 'Soft ripe kiwi pieces'],
  [/mango/i, 'Ripe mango puree or soft mango spears'],
  [/orange|grapefruit/i, 'Peeled citrus segments, membrane removed'],
  [/avocado/i, 'Ripe avocado'],
  [/hemp/i, 'Shelled hemp hearts'],
  [/flax/i, 'Ground flaxseed'],
  [/chia/i, 'Chia seeds soaked until fully gelled'],
  [/almond butter|almond toast|iron almond/i, 'Thinly spread almond butter'],
  [/peanut|\bpb\b/i, 'Thinly spread peanut butter'],
  [/cashew/i, 'Thinly spread cashew butter'],
  [/toast|sandwich/i, 'Soft whole wheat toast strips'],
  [/waffle/i, 'Soft waffle strips'],
  [/pancake|latke|fritter/i, 'Soft cooked pancake or fritter strips'],
  [/oatmeal|oat|cereal/i, 'Iron-fortified infant oat cereal or cooked oatmeal'],
  [/quinoa/i, 'Cooked quinoa or infant quinoa cereal'],
  [/rice|risotto/i, 'Soft cooked rice'],
  [/pasta|noodle|bolognese/i, 'Soft cooked pasta'],
  [/egg|omelette|frittata|muffin|pinwheel/i, 'Egg cooked until fully set'],
  [/cheese|cheddar|ricotta|cottage|cream cheese|yogurt/i, 'Full-fat pasteurized dairy'],
  [/chicken/i, 'Finely shredded cooked chicken'],
  [/turkey/i, 'Fully cooked ground turkey'],
  [/steak|beef|meat sauce|bolognese|meatball/i, 'Fully cooked beef, shredded or minced'],
  [/pork/i, 'Fully cooked pork, shredded or minced'],
  [/salmon/i, 'Cooked salmon, bones removed'],
  [/fish|cajun fish|white fish/i, 'Cooked white fish, bones removed'],
  [/tofu/i, 'Soft cooked tofu strips or cubes'],
  [/lentil|bean|chickpea|hummus/i, 'Soft cooked legumes or hummus'],
  [/sweet potato/i, 'Soft cooked sweet potato'],
  [/pumpkin|acorn squash|squash/i, 'Soft cooked squash or pumpkin'],
  [/zucchini/i, 'Soft cooked zucchini'],
  [/broccoli/i, 'Soft cooked broccoli'],
  [/cauliflower/i, 'Soft cooked cauliflower'],
  [/mushroom/i, 'Finely chopped cooked mushrooms'],
  [/tomato|caprese/i, 'Soft tomato, peeled and chopped'],
  [/carrot/i, 'Soft cooked carrot'],
  [/beetroot|beet/i, 'Soft cooked beetroot'],
  [/potato|mashed potatoes/i, 'Soft cooked potato or mashed potato'],
  [/veggie|vegetable|mash|burger/i, 'Soft cooked vegetables'],
  [/quesadilla|naan|cracker/i, 'Soft bread, tortilla, naan, or cracker pieces'],
  [/soup|chili|stew/i, 'Low-sodium broth or water as needed'],
];

function unique(items) {
  return [...new Set(items.filter(Boolean).map((item) => item.trim()).filter(Boolean))];
}

function titleIngredients(title) {
  const matched = [];
  for (const [pattern, ingredient] of INGREDIENT_RULES) {
    if (pattern.test(title)) matched.push(ingredient);
  }

  if (matched.length === 0) {
    matched.push(`${title} ingredients, cooked until soft and baby-safe`);
  }

  if (!matched.some((item) => /breast milk|formula|water|broth|yogurt/i.test(item))) {
    matched.push('Breast milk, formula, water, yogurt, or unsalted broth as needed for texture');
  }

  return unique(matched);
}

function titleSteps(title, ingredients) {
  const lower = title.toLowerCase();

  if (/smoothie/.test(lower)) {
    return [
      'Prepare the toast, fruit, and dairy ingredients.',
      'Blend the smoothie ingredients until completely smooth.',
      'Cut toast into baby-safe strips and spread toppings thinly.',
      'Serve the smoothie by spoon or open cup and supervise closely.',
    ];
  }

  if (/toast|sandwich/.test(lower)) {
    return [
      'Toast bread lightly until soft, not hard or crunchy.',
      'Spread the topping in a very thin layer.',
      'Add soft fruit, dairy, or vegetable topping as listed.',
      'Cut into baby-safe strips or small pieces before serving.',
    ];
  }

  if (/pancake|latke|fritter|waffle/.test(lower)) {
    return [
      'Prepare the batter or cooked base with the listed ingredients.',
      'Cook until the center is fully set and the outside is soft.',
      'Cool completely before serving.',
      'Cut into strips or small soft pieces for baby-led feeding.',
    ];
  }

  if (/egg|omelette|frittata|muffin|pinwheel/.test(lower)) {
    return [
      'Whisk the egg with the listed soft ingredients.',
      'Cook until the egg is fully set with no runny center.',
      'Cool, then cut into thin strips or small pieces.',
      'Serve with the paired fruit, vegetable, or grain.',
    ];
  }

  if (/oatmeal|cereal|quinoa|chia|pudding/.test(lower)) {
    return [
      'Cook or soak the grain or seeds until very soft.',
      'Mash or puree the fruit ingredient until smooth.',
      'Mix together and thin with breast milk, formula, water, or yogurt as needed.',
      'Serve by spoon at a safe temperature.',
    ];
  }

  if (/pasta|noodle|risotto|bolognese/.test(lower)) {
    return [
      'Cook pasta, rice, or grains until very soft.',
      'Prepare the sauce or protein until fully cooked.',
      'Combine and chop, mash, or mince to a baby-safe texture.',
      'Cool before serving.',
    ];
  }

  if (/fish|salmon|chicken|turkey|beef|steak|pork|meatball/.test(lower)) {
    return [
      'Cook the protein thoroughly and check carefully for bones or tough pieces.',
      'Prepare the paired fruit, vegetable, or grain until soft.',
      'Shred, mince, mash, or cut everything into baby-safe pieces.',
      'Cool before serving and supervise closely.',
    ];
  }

  if (/tofu|lentil|bean|chickpea|hummus|veggie|vegetable|mash|burger|soup|stew|chili/.test(lower)) {
    return [
      'Cook vegetables, tofu, or legumes until very soft.',
      'Mash, mince, or puree to an age-appropriate texture.',
      'Thin with water, breast milk, formula, yogurt, or unsalted broth if needed.',
      'Serve warm, not hot.',
    ];
  }

  return [
    `Prepare ${ingredients[0].toLowerCase()} and the remaining ingredients until soft.`,
    'Mash, mince, shred, or cut into safe strips for the baby.',
    'Adjust thickness with breast milk, formula, water, yogurt, or unsalted broth.',
    'Cool before serving and supervise the child while eating.',
  ];
}

function imageForIngredient(ingredient) {
  for (const [pattern, file] of INGREDIENT_IMAGE_RULES) {
    if (pattern.test(ingredient)) return `${MATERIAL_IMAGE}${file}`;
  }
  return `${MATERIAL_IMAGE}fruits-and-vegetables.png`;
}

function ingredientDetails(ingredients) {
  return ingredients.map((ingredient) => ({
    name: ingredient,
    image_url: imageForIngredient(ingredient),
  }));
}

function detailFor(row) {
  const override = TITLE_OVERRIDES[row.title];
  const ingredients = override?.ingredients ?? titleIngredients(row.title);
  const steps = override?.steps ?? titleSteps(row.title, ingredients);

  return {
    ingredients,
    ingredient_details: ingredientDetails(ingredients),
    steps,
    description: `${row.title} for months 7-11, prepared as a soft baby-safe ${row.meal_slot} recipe.`,
  };
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(`
    SELECT id, title, meal_slot, nutrition_info
    FROM recipes
    WHERE target = 'baby'
      AND baby_age_group = '7-11'
      AND language = 'en'
      AND nutrition_info->>'source' = 'ui/babyG/nutritions'
    ORDER BY meal_slot, title
  `);

  for (const row of rows) {
    const detail = detailFor(row);
    const nutritionInfo = {
      ...(row.nutrition_info || {}),
      steps: detail.steps,
      instructions: INSTRUCTION_NOTES,
      general_notes: GENERAL_NOTES,
      ingredient_details: detail.ingredient_details,
      doctor_verified: false,
      detail_source: 'ui/babyG/nutritions/7-11/Recipes/Detail',
      detail_status: 'recipe_specific_backfill',
    };

    await client.query(
      `
        UPDATE recipes
        SET description = $2,
            ingredients = $3,
            instructions = $4,
            nutrition_info = $5::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [
        row.id,
        detail.description,
        detail.ingredients,
        detail.steps,
        JSON.stringify(nutritionInfo),
      ],
    );
  }

  const verification = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE array_length(ingredients, 1) > 0
          AND NOT EXISTS (
            SELECT 1
            FROM unnest(ingredients) AS ingredient
            WHERE ingredient ILIKE 'Soft cooked fruits,%'
               OR ingredient = title
          )
          AND EXISTS (
            SELECT 1
            FROM unnest(ingredients) AS ingredient
            WHERE ingredient NOT ILIKE 'Breast milk, formula, water, yogurt,%'
          )
      )::int AS specific_ingredients,
      COUNT(*) FILTER (
        WHERE nutrition_info->>'detail_status' = 'recipe_specific_backfill'
          AND jsonb_array_length(nutrition_info->'ingredient_details') > 0
          AND jsonb_array_length(nutrition_info->'steps') > 0
          AND jsonb_array_length(nutrition_info->'instructions') > 0
          AND jsonb_array_length(nutrition_info->'general_notes') > 0
      )::int AS specific_details
    FROM recipes
    WHERE target = 'baby'
      AND baby_age_group = '7-11'
      AND language = 'en'
      AND nutrition_info->>'source' = 'ui/babyG/nutritions'
  `);

  console.log(JSON.stringify(verification.rows[0], null, 2));
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
