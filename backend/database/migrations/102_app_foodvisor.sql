-- Foodvisor: food reference data, meal logging and nutrition goals.
CREATE SCHEMA IF NOT EXISTS foodvisor;

CREATE TABLE foodvisor.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  category text,
  serving_size_g numeric(7, 2) CHECK (serving_size_g IS NULL OR serving_size_g > 0),
  -- { calories, proteinG, carbsG, fatG, fiberG?, sugarG?, sodiumMg? } per 100 g.
  nutrients_per_100g jsonb NOT NULL,
  -- USDA FoodData Central is the authoritative source for nutrition values (see Foodvisor/CLAUDE.md).
  source text NOT NULL DEFAULT 'manual',
  source_ref text,
  doctor_verified boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  search tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(category, ''))
  ) STORED
);
CREATE INDEX foods_search_idx ON foodvisor.foods USING gin (search);

CREATE TABLE foodvisor.nutrition_goals (
  user_id uuid PRIMARY KEY REFERENCES identity.users (id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('lose', 'maintain', 'gain', 'custom')),
  calories integer NOT NULL CHECK (calories BETWEEN 800 AND 6000),
  protein_g integer CHECK (protein_g IS NULL OR protein_g >= 0),
  carbs_g integer CHECK (carbs_g IS NULL OR carbs_g >= 0),
  fat_g integer CHECK (fat_g IS NULL OR fat_g >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  eaten_at timestamptz NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'photo', 'barcode', 'recipe')),
  -- Set when the meal was cooked from a Healthy Recipes recipe (closes the Recipes -> Foodvisor loop).
  recipe_content_id uuid REFERENCES content.items (id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meal_logs_user_time_idx ON foodvisor.meal_logs (user_id, eaten_at DESC);

-- Nutrient values are snapshotted at log time so later food-data corrections don't rewrite history.
CREATE TABLE foodvisor.meal_log_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id uuid NOT NULL REFERENCES foodvisor.meal_logs (id) ON DELETE CASCADE,
  food_id uuid REFERENCES foodvisor.foods (id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity_g numeric(7, 2),
  calories numeric(8, 2) NOT NULL DEFAULT 0,
  protein_g numeric(7, 2) NOT NULL DEFAULT 0,
  carbs_g numeric(7, 2) NOT NULL DEFAULT 0,
  fat_g numeric(7, 2) NOT NULL DEFAULT 0
);
CREATE INDEX meal_log_items_log_idx ON foodvisor.meal_log_items (meal_log_id);
