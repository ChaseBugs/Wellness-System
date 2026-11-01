-- HeightIncrease: height measurements. Posture/activity programs live in the shared Routine Engine.
CREATE SCHEMA IF NOT EXISTS height;

CREATE TABLE height.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  measured_on date NOT NULL,
  height_cm numeric(5, 1) NOT NULL CHECK (height_cm BETWEEN 40 AND 250),
  weight_kg numeric(5, 2) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 2 AND 300),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, measured_on)
);
