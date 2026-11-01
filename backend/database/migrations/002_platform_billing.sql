-- Subscriptions: per-app "App Pro" plans and the cross-app "Wellness Pass", verified server-side.
CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('app_pro', 'wellness_pass')),
  app_code text REFERENCES identity.apps (code),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  price_usd numeric(8, 2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((tier = 'app_pro' AND app_code IS NOT NULL) OR (tier = 'wellness_pass' AND app_code IS NULL))
);

-- Store SKUs that map to a plan. The same plan can be sold in several apps and stores.
CREATE TABLE billing.plan_store_products (
  plan_id uuid NOT NULL REFERENCES billing.plans (id) ON DELETE CASCADE,
  store text NOT NULL CHECK (store IN ('apple', 'google', 'dev')),
  product_id text NOT NULL,
  PRIMARY KEY (store, product_id)
);

-- Apps a plan unlocks: one row for App Pro, every eligible app for Wellness Pass.
CREATE TABLE billing.plan_apps (
  plan_id uuid NOT NULL REFERENCES billing.plans (id) ON DELETE CASCADE,
  app_code text NOT NULL REFERENCES identity.apps (code),
  PRIMARY KEY (plan_id, app_code)
);

CREATE TABLE billing.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES billing.plans (id),
  store text NOT NULL CHECK (store IN ('apple', 'google', 'dev')),
  product_id text NOT NULL,
  original_transaction_id text NOT NULL,
  latest_transaction_id text,
  purchased_in_app text REFERENCES identity.apps (code),
  status text NOT NULL CHECK (status IN ('active', 'grace_period', 'expired', 'refunded', 'revoked', 'cancelled')),
  auto_renew boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL,
  expires_at timestamptz,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- One store transaction can only ever belong to one account (blocks receipt sharing).
  UNIQUE (store, original_transaction_id)
);
CREATE INDEX purchases_user_status_idx ON billing.purchases (user_id, status);

-- Append-only audit of every verification, restore and store notification.
CREATE TABLE billing.purchase_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  purchase_id uuid NOT NULL REFERENCES billing.purchases (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX purchase_events_purchase_idx ON billing.purchase_events (purchase_id, created_at DESC);
