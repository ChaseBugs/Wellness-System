-- Notification Engine: push devices and timed reminders for every app.
CREATE SCHEMA IF NOT EXISTS notify;

CREATE TABLE notify.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  app_code text NOT NULL REFERENCES identity.apps (code),
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  push_token text NOT NULL UNIQUE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX devices_user_app_idx ON notify.devices (user_id, app_code);

CREATE TABLE notify.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  app_code text NOT NULL REFERENCES identity.apps (code),
  title text NOT NULL,
  body text,
  time_of_day time NOT NULL,
  -- 0 = Sunday ... 6 = Saturday, evaluated in `timezone`.
  days_of_week smallint[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}' CHECK (days_of_week <@ '{0,1,2,3,4,5,6}'::smallint[]),
  timezone text NOT NULL DEFAULT 'UTC',
  deep_link text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reminders_user_app_idx ON notify.reminders (user_id, app_code);
