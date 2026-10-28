-- Migration 034: Normalized recipe_ingredients table.
-- Replaces the flat string[] ingredients column with a proper relational table.
-- Each row stores one ingredient with separate name, amount, unit, notes, and image_url
-- so the mobile app and admin panel can render ingredient cards (image + name + qty).
--
-- Data migration: parses the existing ingredients string array using the pattern
--   "Ingredient Name (amount unit)"  →  name="Ingredient Name", amount="amount unit"
-- Strings without parentheses are stored with amount = NULL.

-- ── 1. Create table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id          SERIAL       PRIMARY KEY,
  recipe_id   INTEGER      NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  amount      VARCHAR(100),          -- e.g. "2-4 tbsp", "½ cup", "4+ oz"
  unit        VARCHAR(50),           -- e.g. "cup", "tbsp", "oz", "g"  (optional split)
  notes       TEXT,                  -- e.g. "or formula", "softened"
  image_url   VARCHAR(500),          -- individual ingredient photo (populated later)
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── 2. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id
  ON recipe_ingredients(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_order
  ON recipe_ingredients(recipe_id, sort_order);

-- ── 3. Migrate existing data ─────────────────────────────────────────────────
-- Parses "Name (amount)" strings from recipes.ingredients string array.
-- Uses a trailing-parenthesis regex so "Whole Milk (½ cup)" → name, amount.
-- Strings without trailing parens are stored with amount = NULL.

INSERT INTO recipe_ingredients (recipe_id, name, amount, sort_order)
SELECT
  r.id                                           AS recipe_id,

  -- name: everything before the last "(amount)" block
  CASE
    WHEN u.ing ~ '\(.+\)\s*$'
      THEN trim(regexp_replace(u.ing, '\s*\([^)]*\)\s*$', ''))
    ELSE trim(u.ing)
  END                                            AS name,

  -- amount: the content inside the last pair of parentheses
  CASE
    WHEN u.ing ~ '\(.+\)\s*$'
      THEN trim((regexp_match(u.ing, '\(([^)]+)\)\s*$'))[1])
    ELSE NULL
  END                                            AS amount,

  (u.ordinality - 1)::INTEGER                   AS sort_order

FROM recipes r
CROSS JOIN LATERAL unnest(r.ingredients) WITH ORDINALITY AS u(ing, ordinality)
WHERE r.ingredients IS NOT NULL
  AND array_length(r.ingredients, 1) > 0
ON CONFLICT DO NOTHING;

-- ── 4. Verification query (informational) ────────────────────────────────────

DO $$
DECLARE
  total_rows INTEGER;
  recipe_count INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT recipe_id)
    INTO total_rows, recipe_count
    FROM recipe_ingredients;
  RAISE NOTICE 'recipe_ingredients: % rows across % recipes', total_rows, recipe_count;
END $$;
