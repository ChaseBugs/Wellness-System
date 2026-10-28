-- Migration 034: Fill the two 7-11 UI recipe images not covered by the first image extraction.

UPDATE recipes
SET image_url = '/images/nutrition/recipes/peach-oatmeal.png'
WHERE target = 'baby'
  AND language = 'en'
  AND baby_age_group = '7-11'
  AND lower(title) = lower('Peach Oatmeal');

UPDATE recipes
SET image_url = '/images/nutrition/recipes/meat-sauce-pasta.png'
WHERE target = 'baby'
  AND language = 'en'
  AND baby_age_group = '7-11'
  AND lower(title) = lower('Pasta Bolognese');

