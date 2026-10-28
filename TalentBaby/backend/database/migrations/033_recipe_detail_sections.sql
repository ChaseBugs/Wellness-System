-- Migration 033: Ensure UI-derived recipes expose all detail sections used by mobile.
-- The source screenshots are grouped by meal; the recipe title/meal/age mapping stays in
-- 031_seed_ui_nutrition.sql and image URLs stay in 032_set_nutrition_image_urls.sql.

UPDATE recipes
SET nutrition_info =
  COALESCE(nutrition_info, '{}'::jsonb)
  || jsonb_build_object(
    'nutrients', COALESCE(nutrition_info->'nutrients', '[]'::jsonb),
    'steps', to_jsonb(instructions),
    'instructions', jsonb_build_array(
      'Serve only after the food has cooled to a safe temperature.',
      'Adjust texture for the baby: puree, mash, mince, shred, or cut into safe strips.',
      'Offer small portions first and watch for tolerance, especially with common allergens.'
    ),
    'general_notes', (
      COALESCE(nutrition_info->'safety_notes', '[]'::jsonb)
      || jsonb_build_array(
        'Use no added salt or sugar for baby meals unless a clinician advises otherwise.',
        'Doctor verification: pending review.'
      )
    ),
    'doctor_verified', false
  )
WHERE target = 'baby'
  AND language = 'en'
  AND nutrition_info->>'source' = 'ui/babyG/nutritions';

