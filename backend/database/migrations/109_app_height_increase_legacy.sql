-- HeightIncrease migration from its legacy MongoDB backend.
-- Exercises and training plans move to the shared Routine Engine; articles to the Content Factory.
-- Everything else is HeightIncrease-only and stays in the `height` schema.

-- 1. Routine Engine: app-specific extras (HeightIncrease category, calories, steps, plan type, ...) and
--    a stable reference so legacy imports upsert instead of duplicating.
ALTER TABLE routine.exercises
  ADD COLUMN attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN source_ref text;
CREATE UNIQUE INDEX routine_exercises_source_ref_idx ON routine.exercises (source_ref) WHERE source_ref IS NOT NULL;

ALTER TABLE routine.routines
  ADD COLUMN attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN source_ref text;
CREATE UNIQUE INDEX routine_routines_source_ref_idx ON routine.routines (source_ref) WHERE source_ref IS NOT NULL;

-- 2. Per-user HeightIncrease profile. The account (name, email, role) stays in identity; the current
--    height is the latest row of height.measurements.
CREATE TABLE height.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES identity.users (id) ON DELETE CASCADE,
  target_height_cm numeric(5, 1) CHECK (target_height_cm IS NULL OR target_height_cm BETWEEN 40 AND 260),
  birth_date date,
  gender text CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  units text NOT NULL DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  notifications_enabled boolean NOT NULL DEFAULT true,
  -- Blocked users lose access to HeightIncrease only, not to their Wellness account.
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  streak_days integer NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Daily wellness log (one row per user and day). Height and weight are also written to
--    height.measurements, which drives the trend.
CREATE TABLE height.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  log_date date NOT NULL,
  height_cm numeric(5, 1) CHECK (height_cm IS NULL OR height_cm BETWEEN 40 AND 250),
  weight_kg numeric(5, 2) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 2 AND 300),
  sleep_hours numeric(4, 1) CHECK (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24),
  water_glasses integer CHECK (water_glasses IS NULL OR water_glasses BETWEEN 0 AND 50),
  mood text CHECK (mood IS NULL OR mood IN ('great', 'good', 'okay', 'tired', 'bad')),
  workout_minutes integer NOT NULL DEFAULT 0 CHECK (workout_minutes BETWEEN 0 AND 1440),
  -- [{ exerciseId, title, durationSeconds, calories }]
  completed_exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

CREATE TABLE height.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  goal_type text NOT NULL DEFAULT 'workout' CHECK (goal_type IN ('height', 'weight', 'workout', 'sleep', 'custom')),
  target_value numeric,
  current_value numeric NOT NULL DEFAULT 0,
  unit text,
  starts_at timestamptz,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX height_goals_user_idx ON height.goals (user_id, status);

-- 4. App-managed content: home banners, admin push campaigns and app settings.
CREATE TABLE height.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  placement text NOT NULL DEFAULT 'home-top' CHECK (placement IN ('home-top', 'home-card', 'reports-top', 'modal', 'discover')),
  image_url text,
  icon text,
  cta_label text,
  cta_url text,
  background_color text NOT NULL DEFAULT '#6696f6',
  starts_at timestamptz,
  ends_at timestamptz,
  setup boolean NOT NULL DEFAULT false,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  source_ref text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campaigns are authored here; delivery to devices goes through the Notification module.
CREATE TABLE height.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'free', 'premium', 'inactive')),
  notification_type text NOT NULL DEFAULT 'motivation' CHECK (notification_type IN ('motivation', 'reminder', 'update', 'promotion')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  setup boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  source_ref text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE height.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  setup boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Admin read models.
CREATE VIEW height.user_admin_view AS
  SELECT p.id, p.user_id, u.email, u.display_name, u.role, p.status, p.streak_days, p.points,
         p.target_height_cm, p.birth_date, p.gender, p.units, p.notifications_enabled, p.avatar_url,
         m.height_cm AS current_height_cm, m.weight_kg, m.measured_on AS last_measured_on,
         p.created_at, p.updated_at
  FROM height.profiles p
  JOIN identity.users u ON u.id = p.user_id
  LEFT JOIN LATERAL (
    SELECT height_cm, weight_kg, measured_on FROM height.measurements hm
    WHERE hm.user_id = p.user_id ORDER BY measured_on DESC LIMIT 1
  ) m ON true;

CREATE VIEW height.log_admin_view AS
  SELECT l.*, u.email AS user_email FROM height.daily_logs l JOIN identity.users u ON u.id = l.user_id;

CREATE VIEW height.goal_admin_view AS
  SELECT g.*, u.email AS user_email FROM height.goals g JOIN identity.users u ON u.id = g.user_id;
