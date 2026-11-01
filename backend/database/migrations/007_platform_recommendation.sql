-- Cross-app growth engine: rules from the recommendation matrix plus per-user interaction tracking.
CREATE SCHEMA IF NOT EXISTS reco;

CREATE TABLE reco.rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  source_app text NOT NULL REFERENCES identity.apps (code),
  target_app text NOT NULL REFERENCES identity.apps (code),
  -- Analytics event in the source app that signals the user's next need.
  trigger_event text NOT NULL,
  lookback_days integer NOT NULL DEFAULT 14 CHECK (lookback_days BETWEEN 1 AND 90),
  headline text NOT NULL,
  body text,
  deep_link text,
  priority integer NOT NULL DEFAULT 100,
  max_impressions_per_week integer NOT NULL DEFAULT 3 CHECK (max_impressions_per_week > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source_app <> target_app)
);
CREATE INDEX rules_source_idx ON reco.rules (source_app) WHERE is_active;

CREATE TABLE reco.interactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  rule_id uuid NOT NULL REFERENCES reco.rules (id) ON DELETE CASCADE,
  source_app text NOT NULL REFERENCES identity.apps (code),
  target_app text NOT NULL REFERENCES identity.apps (code),
  action text NOT NULL CHECK (action IN ('impression', 'click', 'dismiss', 'install')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interactions_user_rule_idx ON reco.interactions (user_id, rule_id, action, created_at DESC);
CREATE INDEX interactions_rule_time_idx ON reco.interactions (rule_id, created_at);
-- An attributed install is counted once per user and rule.
CREATE UNIQUE INDEX interactions_install_once_idx ON reco.interactions (user_id, rule_id) WHERE action = 'install';
