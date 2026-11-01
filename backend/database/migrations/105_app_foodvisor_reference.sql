-- Foodvisor migration from the legacy MongoDB backend: the full food composition model, the nutrition
-- reference data (WS/T 578 DRIs, condition diets, risk thresholds, terminology), user profiles, weight
-- entries, programs and the Sasang constitution questionnaire. Recipes move to content.items instead.

-- 1. Foods: extend the simple table from 102 to the legacy document shape.
ALTER TABLE foodvisor.foods DROP COLUMN search;
ALTER TABLE foodvisor.foods DROP COLUMN nutrients_per_100g;
ALTER TABLE foodvisor.foods RENAME COLUMN name TO korean_name;
ALTER TABLE foodvisor.foods RENAME COLUMN source TO data_source;
ALTER TABLE foodvisor.foods RENAME COLUMN source_ref TO source_food_id;
ALTER TABLE foodvisor.foods ALTER COLUMN data_source DROP NOT NULL;

ALTER TABLE foodvisor.foods
  ADD COLUMN legacy_id text UNIQUE,
  ADD COLUMN chinese_name text,
  ADD COLUMN fdc_id integer UNIQUE,
  ADD COLUMN data_type text,
  ADD COLUMN food_group text,
  ADD COLUMN food_subgroup text,
  -- Nutrient values below are per `serving_size` (100 g for every imported dataset).
  ADD COLUMN serving_size text NOT NULL DEFAULT '100 g',
  ADD COLUMN calories numeric(9, 2) NOT NULL DEFAULT 0 CHECK (calories >= 0),
  ADD COLUMN macros jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN saturated_fat numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN trans_fat numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN unsaturated_fat numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN omega3 numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN omega6 numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN cholesterol_mg numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN sugar numeric(9, 3) NOT NULL DEFAULT 0,
  ADD COLUMN glycemic_index numeric(6, 2) NOT NULL DEFAULT 0,
  ADD COLUMN oiliness text,
  ADD COLUMN oiliness_score numeric(3, 1) NOT NULL DEFAULT 0 CHECK (oiliness_score BETWEEN 0 AND 5),
  ADD COLUMN vitamins jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN minerals jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN best_time_to_eat text[] NOT NULL DEFAULT '{}',
  ADD COLUMN good_pairings text[] NOT NULL DEFAULT '{}',
  ADD COLUMN avoid_pairings text[] NOT NULL DEFAULT '{}',
  ADD COLUMN caution_groups text[] NOT NULL DEFAULT '{}',
  ADD COLUMN cautions text,
  ADD COLUMN korean_cautions text,
  ADD COLUMN benefits text,
  ADD COLUMN allergens text[] NOT NULL DEFAULT '{}',
  ADD COLUMN ingredients text[] NOT NULL DEFAULT '{}',
  ADD COLUMN additives text[] NOT NULL DEFAULT '{}',
  ADD COLUMN daily_value_percent jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN daily_value_percent_by_profile jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN diet_use_cases text[] NOT NULL DEFAULT '{}',
  ADD COLUMN diet_use_note text,
  ADD COLUMN source_nutrition jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN source_note text,
  ADD COLUMN source_refs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN barcode text,
  ADD COLUMN image_url text,
  ADD COLUMN image_source text,
  ADD COLUMN image_source_url text,
  ADD COLUMN image_page_url text,
  ADD COLUMN image_license text,
  ADD COLUMN image_status text,
  ADD COLUMN icon text;

ALTER TABLE foodvisor.foods ADD COLUMN search tsvector GENERATED ALWAYS AS (
  to_tsvector('simple', coalesce(korean_name, '') || ' ' || coalesce(chinese_name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(category, ''))
) STORED;
CREATE INDEX foods_search_idx ON foodvisor.foods USING gin (search);
CREATE INDEX foods_category_idx ON foodvisor.foods (category);
CREATE INDEX foods_data_source_idx ON foodvisor.foods (data_source);
CREATE INDEX foods_barcode_idx ON foodvisor.foods (barcode) WHERE barcode IS NOT NULL;

-- 2. Meal logs: keep the legacy capture sources and photo reference.
ALTER TABLE foodvisor.meal_logs DROP CONSTRAINT meal_logs_source_check;
ALTER TABLE foodvisor.meal_logs ADD CONSTRAINT meal_logs_source_check
  CHECK (source IN ('manual', 'search', 'photo', 'barcode', 'voice', 'favorite', 'recipe'));
ALTER TABLE foodvisor.meal_logs ADD COLUMN photo_url text;

-- 3. Per-user Foodvisor profile (medical conditions are health data and stay in this schema).
CREATE TABLE foodvisor.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES identity.users (id) ON DELETE CASCADE,
  goal text,
  gender text CHECK (gender IS NULL OR gender IN ('male', 'female', 'non_binary')),
  age integer CHECK (age IS NULL OR age BETWEEN 13 AND 120),
  height_cm numeric(5, 1) CHECK (height_cm IS NULL OR height_cm >= 50),
  current_weight_kg numeric(5, 2) CHECK (current_weight_kg IS NULL OR current_weight_kg >= 20),
  target_weight_kg numeric(5, 2) CHECK (target_weight_kg IS NULL OR target_weight_kg >= 20),
  activity_level text CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'low_active', 'active', 'very_active')),
  dietary_restrictions text[] NOT NULL DEFAULT '{}',
  medical_conditions text[] NOT NULL DEFAULT '{}',
  program_stage text NOT NULL DEFAULT 'onboarding',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  measured_on date NOT NULL,
  weight_kg numeric(5, 2) NOT NULL CHECK (weight_kg BETWEEN 20 AND 400),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, measured_on)
);

-- 4. Reference data managed in the admin (every row carries source tracing and a doctor review flag).
CREATE TABLE foodvisor.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  calories_per_hour numeric(8, 2) NOT NULL DEFAULT 0 CHECK (calories_per_hour >= 0),
  met_value numeric(5, 2) NOT NULL CHECK (met_value >= 0),
  icon text,
  description text,
  data_source text,
  source_code text,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  stage text NOT NULL,
  focus text NOT NULL,
  description text NOT NULL,
  cta text NOT NULL DEFAULT 'Next',
  data_source text,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.reference_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text NOT NULL UNIQUE,
  title text NOT NULL,
  standard_code text,
  year integer CHECK (year IS NULL OR year BETWEEN 1900 AND 2100),
  category text NOT NULL,
  topic text NOT NULL,
  condition_key text,
  file_path text NOT NULL,
  language text NOT NULL DEFAULT 'zh-CN',
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.nutrient_intake_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  standard_code text NOT NULL,
  nutrient_key text NOT NULL,
  nutrient_label text NOT NULL,
  reference_type text NOT NULL,
  unit text NOT NULL,
  raw_value text NOT NULL,
  comparator text NOT NULL DEFAULT 'eq' CHECK (comparator IN ('eq', 'lt', 'lte', 'gt', 'gte', 'range')),
  value numeric,
  value_min numeric,
  value_max numeric,
  age_group text NOT NULL,
  age_min numeric,
  age_max numeric,
  gender text NOT NULL DEFAULT 'all' CHECK (gender IN ('all', 'male', 'female')),
  life_stage text NOT NULL DEFAULT 'general',
  population_group text NOT NULL DEFAULT 'general',
  physical_activity_level text,
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX nutrient_intake_rules_match_idx ON foodvisor.nutrient_intake_rules (nutrient_key, gender, age_min, age_max, reference_type);

CREATE TABLE foodvisor.condition_diet_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_key text NOT NULL UNIQUE,
  condition_label text NOT NULL,
  category text NOT NULL DEFAULT 'condition_diet',
  description_ko text,
  sort_order integer NOT NULL DEFAULT 1,
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.condition_diet_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  condition_key text NOT NULL,
  condition_label text NOT NULL,
  rule_type text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  nutrient_key text,
  comparator text NOT NULL DEFAULT 'eq' CHECK (comparator IN ('eq', 'lt', 'lte', 'gt', 'gte', 'range', 'avoid', 'prefer')),
  target_value numeric,
  target_min numeric,
  target_max numeric,
  unit text,
  recommendation_ko text NOT NULL,
  recommendation_zh text,
  food_tags_prefer text[] NOT NULL DEFAULT '{}',
  food_tags_avoid text[] NOT NULL DEFAULT '{}',
  caution_tags text[] NOT NULL DEFAULT '{}',
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX condition_diet_rules_condition_idx ON foodvisor.condition_diet_rules (condition_key, priority);

CREATE TABLE foodvisor.risk_assessment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  standard_code text NOT NULL,
  metric_key text NOT NULL,
  metric_label text NOT NULL,
  population_group text NOT NULL,
  age_min numeric,
  age_max numeric,
  gender text NOT NULL DEFAULT 'all' CHECK (gender IN ('all', 'male', 'female')),
  thresholds jsonb NOT NULL DEFAULT '[]'::jsonb,
  interpretation_ko text NOT NULL,
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.nutrition_terminology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_key text NOT NULL UNIQUE,
  category text NOT NULL,
  chinese_term text NOT NULL,
  english_term text,
  korean_term text,
  abbreviation text,
  unit text,
  definition_ko text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.data_validation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  target_collection text NOT NULL,
  field_path text NOT NULL,
  rule_type text NOT NULL,
  expected_unit text,
  required boolean NOT NULL DEFAULT false,
  min_value numeric,
  max_value numeric,
  message_ko text NOT NULL,
  data_source text NOT NULL,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.daily_value_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key text NOT NULL UNIQUE,
  label text NOT NULL,
  age_min numeric NOT NULL CHECK (age_min >= 0),
  age_max numeric NOT NULL CHECK (age_max >= 0),
  gender text NOT NULL DEFAULT 'all' CHECK (gender IN ('all', 'male', 'female')),
  purpose text NOT NULL,
  notes text,
  "values" jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_source text,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Linear-programming bounds for the diet optimizer, grouped by profile.
CREATE TABLE foodvisor.nutrition_constraints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key text NOT NULL,
  nutrient_key text NOT NULL,
  nutrient_label text NOT NULL,
  unit text,
  lower_bound numeric NOT NULL DEFAULT 0,
  upper_bound numeric NOT NULL DEFAULT 0,
  is_percent_of_calories boolean NOT NULL DEFAULT false,
  calories_per_gram numeric NOT NULL DEFAULT 0,
  data_source text,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_key, nutrient_key)
);

CREATE TABLE foodvisor.recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  korean_name text,
  food_name text,
  fdc_id integer,
  category text,
  amount numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'g',
  preparation text,
  optional boolean NOT NULL DEFAULT false,
  substitutes text[] NOT NULL DEFAULT '{}',
  notes text,
  data_source text NOT NULL DEFAULT 'web_admin',
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Sasang constitution questionnaire (a wellness tendency survey, not a medical diagnosis).
CREATE TABLE foodvisor.human_type_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL UNIQUE,
  sort_order integer NOT NULL,
  category_key text NOT NULL,
  category_name_ko text NOT NULL,
  category_name_en text,
  prompt_ko text NOT NULL,
  input_type text NOT NULL DEFAULT 'single' CHECK (input_type IN ('single', 'scale', 'multi', 'text')),
  scale_min integer NOT NULL DEFAULT 1,
  scale_max integer NOT NULL DEFAULT 5,
  scale_min_label_ko text,
  scale_max_label_ko text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer_list_ko text,
  weight numeric NOT NULL DEFAULT 1,
  is_core boolean NOT NULL DEFAULT false,
  use_for_classification boolean NOT NULL DEFAULT true,
  use_for_recommendation boolean NOT NULL DEFAULT false,
  scoring_note_ko text,
  analysis_note_ko text,
  data_source text,
  source_note text,
  source_refs text[] NOT NULL DEFAULT '{}',
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE foodvisor.human_type_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES identity.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'reviewed', 'archived')),
  classifier_version text NOT NULL DEFAULT 'sasang-v1-curated',
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_type text NOT NULL DEFAULT 'REVIEW' CHECK (result_type IN ('TE', 'SE', 'SY', 'TY', 'MIXED', 'REVIEW')),
  result_label_ko text,
  second_type text,
  confidence numeric NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  total_possible numeric NOT NULL DEFAULT 0,
  recommendation_tags text[] NOT NULL DEFAULT '{}',
  caution_tags text[] NOT NULL DEFAULT '{}',
  summary_ko text,
  notes text,
  data_source text NOT NULL DEFAULT 'user_input',
  source_note text,
  doctor_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX human_type_surveys_user_idx ON foodvisor.human_type_surveys (user_id, created_at DESC);

-- 6. Read models for the admin (user-owned rows joined with the account they belong to).
CREATE VIEW foodvisor.profile_admin_view AS
  SELECT p.id, p.user_id, u.email, u.display_name, p.goal, p.gender, p.age, p.height_cm, p.current_weight_kg,
         p.target_weight_kg, p.activity_level, g.calories AS calorie_goal, p.dietary_restrictions,
         p.medical_conditions, p.program_stage, p.created_at, p.updated_at
  FROM foodvisor.profiles p
  JOIN identity.users u ON u.id = p.user_id
  LEFT JOIN foodvisor.nutrition_goals g ON g.user_id = p.user_id;

CREATE VIEW foodvisor.meal_log_admin_view AS
  SELECT m.id, m.user_id, u.email AS user_email, u.display_name AS user_name, m.eaten_at, m.meal_type, m.source,
         m.recipe_content_id, m.photo_url, m.notes,
         coalesce(string_agg(i.name, ', ' ORDER BY i.name), '') AS food_name,
         coalesce(sum(i.calories), 0) AS calories,
         coalesce(sum(i.protein_g), 0) AS protein_g,
         coalesce(sum(i.carbs_g), 0) AS carbs_g,
         coalesce(sum(i.fat_g), 0) AS fat_g,
         m.created_at, m.updated_at
  FROM foodvisor.meal_logs m
  JOIN identity.users u ON u.id = m.user_id
  LEFT JOIN foodvisor.meal_log_items i ON i.meal_log_id = m.id
  GROUP BY m.id, u.email, u.display_name;

CREATE VIEW foodvisor.weight_entry_admin_view AS
  SELECT w.id, w.user_id, u.email AS user_email, u.display_name AS user_name, w.measured_on, w.weight_kg, w.note,
         w.created_at, w.updated_at
  FROM foodvisor.weight_entries w
  JOIN identity.users u ON u.id = w.user_id;

CREATE VIEW foodvisor.human_type_survey_admin_view AS
  SELECT s.*, u.email AS user_email, u.display_name AS user_name
  FROM foodvisor.human_type_surveys s
  LEFT JOIN identity.users u ON u.id = s.user_id;
