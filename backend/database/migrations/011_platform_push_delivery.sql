-- Push delivery log. One row per (source, source id, user, occurrence) makes every send idempotent:
-- a reminder fires at most once per local day, a campaign at most once per user.
CREATE TABLE notify.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  app_code text NOT NULL REFERENCES identity.apps (code),
  source text NOT NULL CHECK (source IN ('reminder', 'campaign')),
  source_id uuid NOT NULL,
  -- The reminder's local date (YYYY-MM-DD) or 'once' for a campaign.
  occurrence text NOT NULL,
  title text NOT NULL,
  body text,
  deep_link text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'no_device', 'failed')),
  device_count integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, source_id, user_id, occurrence)
);
CREATE INDEX deliveries_app_created_idx ON notify.deliveries (app_code, created_at DESC);
CREATE INDEX deliveries_user_idx ON notify.deliveries (user_id);
