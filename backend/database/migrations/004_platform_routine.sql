-- Routine Engine shared by Daily Workout, Daily Yoga, HeightIncrease programs and future
-- Stretch & Posture / Face Yoga apps: Routine -> Exercise -> Set/Duration -> Completion -> Progress.
CREATE SCHEMA IF NOT EXISTS routine;

CREATE TABLE routine.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  app_codes text[] NOT NULL CHECK (cardinality(app_codes) > 0),
  body_areas text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  default_duration_seconds integer CHECK (default_duration_seconds IS NULL OR default_duration_seconds > 0),
  default_reps integer CHECK (default_reps IS NULL OR default_reps > 0),
  media jsonb NOT NULL DEFAULT '{}'::jsonb,
  safety_notes text[] NOT NULL DEFAULT '{}',
  contraindications text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  expert_reviewed boolean NOT NULL DEFAULT false,
  review_notes text,
  created_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exercises_apps_idx ON routine.exercises USING gin (app_codes);

CREATE TABLE routine.routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_code text NOT NULL REFERENCES identity.apps (code),
  title text NOT NULL,
  description text,
  goal text,
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  tags text[] NOT NULL DEFAULT '{}',
  is_premium boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  expert_reviewed boolean NOT NULL DEFAULT false,
  review_notes text,
  created_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX routines_app_status_idx ON routine.routines (app_code, status);

CREATE TABLE routine.routine_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES routine.routines (id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  exercise_id uuid NOT NULL REFERENCES routine.exercises (id) ON DELETE RESTRICT,
  sets integer CHECK (sets IS NULL OR sets > 0),
  reps integer CHECK (reps IS NULL OR reps > 0),
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  rest_seconds integer NOT NULL DEFAULT 0 CHECK (rest_seconds >= 0),
  notes text,
  UNIQUE (routine_id, position)
);

-- Sessions are always scoped to the app they were started in.
CREATE TABLE routine.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  app_code text NOT NULL REFERENCES identity.apps (code),
  routine_id uuid REFERENCES routine.routines (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  total_steps integer NOT NULL DEFAULT 0,
  completed_steps integer NOT NULL DEFAULT 0,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  perceived_effort smallint CHECK (perceived_effort IS NULL OR perceived_effort BETWEEN 1 AND 10),
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_app_idx ON routine.sessions (user_id, app_code, started_at DESC);
