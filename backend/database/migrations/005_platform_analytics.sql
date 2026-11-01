-- Analytics: one event stream for sessions, conversions, retention and cross-app journeys.
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES identity.users (id) ON DELETE CASCADE,
  anonymous_id text,
  app_code text NOT NULL REFERENCES identity.apps (code),
  name text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  platform text CHECK (platform IS NULL OR platform IN ('ios', 'android', 'web')),
  app_version text,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);
CREATE INDEX events_app_time_idx ON analytics.events (app_code, occurred_at);
CREATE INDEX events_user_app_time_idx ON analytics.events (user_id, app_code, occurred_at DESC);
CREATE INDEX events_name_time_idx ON analytics.events (name, occurred_at);
