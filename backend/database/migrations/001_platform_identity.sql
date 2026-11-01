-- Identity: one Wellness account shared by every app, plus consent records for cross-app data exchange.
CREATE SCHEMA IF NOT EXISTS identity;

-- Rows are synced from src/config/app-catalog.ts on every migrate run.
CREATE TABLE identity.apps (
  code text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  data_sensitivity text NOT NULL CHECK (data_sensitivity IN ('child', 'health', 'standard')),
  lifecycle text NOT NULL,
  backend_module boolean NOT NULL DEFAULT false,
  wellness_pass_eligible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  display_name text,
  locale text NOT NULL DEFAULT 'en',
  country text,
  timezone text NOT NULL DEFAULT 'UTC',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  marketing_opt_in boolean NOT NULL DEFAULT false,
  cross_app_recommendations boolean NOT NULL DEFAULT true,
  signup_app text REFERENCES identity.apps (code),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_idx ON identity.users (lower(email));

-- Only a SHA-256 hash is stored; `replaced_by` links rotations so token reuse can be detected.
CREATE TABLE identity.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  app_code text REFERENCES identity.apps (code),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by uuid REFERENCES identity.refresh_tokens (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON identity.refresh_tokens (user_id);

-- Which apps each account has used: drives cross-app recommendations and the Wellness Pass offer.
CREATE TABLE identity.app_installs (
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  app_code text NOT NULL REFERENCES identity.apps (code),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, app_code)
);

-- Explicit, purpose-specific permission for `target_app` to read a `scope` of data owned by `source_app`.
CREATE TABLE identity.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  source_app text NOT NULL REFERENCES identity.apps (code),
  target_app text NOT NULL REFERENCES identity.apps (code),
  scope text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CHECK (source_app <> target_app)
);
CREATE UNIQUE INDEX consents_active_idx
  ON identity.consents (user_id, source_app, target_app, scope)
  WHERE revoked_at IS NULL;
