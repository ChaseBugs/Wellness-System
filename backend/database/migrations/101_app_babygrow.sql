-- BabyGrow (TalentBaby): child records are the most sensitive data in the ecosystem.
-- Nothing outside this schema reads them; access is checked per child through `caregivers`.
CREATE SCHEMA IF NOT EXISTS babygrow;

CREATE TABLE babygrow.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date NOT NULL,
  sex text NOT NULL DEFAULT 'unspecified' CHECK (sex IN ('female', 'male', 'unspecified')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE babygrow.caregivers (
  child_id uuid NOT NULL REFERENCES babygrow.children (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  added_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, user_id)
);
CREATE INDEX caregivers_user_idx ON babygrow.caregivers (user_id);

CREATE TABLE babygrow.growth_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES babygrow.children (id) ON DELETE CASCADE,
  measured_on date NOT NULL,
  height_cm numeric(5, 1) CHECK (height_cm IS NULL OR height_cm BETWEEN 20 AND 200),
  weight_kg numeric(5, 2) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 0.3 AND 150),
  head_circumference_cm numeric(4, 1) CHECK (head_circumference_cm IS NULL OR head_circumference_cm BETWEEN 15 AND 70),
  notes text,
  recorded_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (height_cm IS NOT NULL OR weight_kg IS NOT NULL OR head_circumference_cm IS NOT NULL)
);
CREATE INDEX growth_records_child_idx ON babygrow.growth_records (child_id, measured_on);

CREATE TABLE babygrow.care_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES babygrow.children (id) ON DELETE CASCADE,
  log_type text NOT NULL CHECK (log_type IN ('feeding', 'sleep', 'diaper')),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  recorded_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);
CREATE INDEX care_logs_child_idx ON babygrow.care_logs (child_id, started_at DESC);

-- Definitions must cite a validated developmental standard (`source`); none are seeded on purpose.
CREATE TABLE babygrow.milestone_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  domain text NOT NULL CHECK (domain IN ('motor', 'language', 'social', 'cognitive')),
  title text NOT NULL,
  description text,
  age_months_min integer NOT NULL CHECK (age_months_min >= 0),
  age_months_max integer NOT NULL,
  source text NOT NULL,
  expert_reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (age_months_max >= age_months_min)
);

CREATE TABLE babygrow.milestone_checks (
  child_id uuid NOT NULL REFERENCES babygrow.children (id) ON DELETE CASCADE,
  milestone_id uuid NOT NULL REFERENCES babygrow.milestone_definitions (id) ON DELETE CASCADE,
  achieved_on date NOT NULL,
  notes text,
  recorded_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, milestone_id)
);
