-- Healthy Recipes: recipes themselves are Content Factory items (content_type = 'recipe').
-- This schema only holds the user's saved recipes and seven-day meal plans (Meal Planner starts here as a feature).
CREATE SCHEMA IF NOT EXISTS recipes;

CREATE TABLE recipes.saved_recipes (
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES content.items (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

CREATE TABLE recipes.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  start_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meal_plans_user_idx ON recipes.meal_plans (user_id, start_date DESC);

CREATE TABLE recipes.meal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid NOT NULL REFERENCES recipes.meal_plans (id) ON DELETE CASCADE,
  day_index smallint NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  content_id uuid NOT NULL REFERENCES content.items (id) ON DELETE CASCADE,
  servings numeric(4, 1) NOT NULL DEFAULT 1 CHECK (servings > 0),
  UNIQUE (meal_plan_id, day_index, meal_type, content_id)
);
