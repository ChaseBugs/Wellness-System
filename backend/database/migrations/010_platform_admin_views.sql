-- Read models for the unified Wellness admin (platform pages: accounts, subscriptions, audit log).

-- Every account with the apps it uses and how many subscriptions are currently granting access.
CREATE VIEW admin.account_view AS
  SELECT u.id, u.email, u.display_name, u.role, u.locale, u.country, u.timezone,
         u.marketing_opt_in, u.cross_app_recommendations, u.signup_app, u.last_login_at,
         coalesce((SELECT array_agg(i.app_code ORDER BY i.app_code) FROM identity.app_installs i WHERE i.user_id = u.id), '{}') AS apps,
         (SELECT count(*)::int FROM billing.purchases p WHERE p.user_id = u.id AND p.status IN ('active', 'grace_period')) AS active_purchases,
         u.created_at, u.updated_at
  FROM identity.users u;

-- Purchases with the buyer, the plan and the apps the plan unlocks.
CREATE VIEW admin.purchase_view AS
  SELECT p.id, p.user_id, u.email AS user_email, pl.code AS plan_code, pl.name AS plan_name, pl.tier,
         p.store, p.product_id, p.original_transaction_id, p.purchased_in_app, p.status, p.auto_renew,
         p.started_at, p.expires_at, p.last_verified_at,
         coalesce((SELECT array_agg(pa.app_code ORDER BY pa.app_code) FROM billing.plan_apps pa WHERE pa.plan_id = p.plan_id), '{}') AS unlocks,
         p.created_at, p.updated_at
  FROM billing.purchases p
  JOIN identity.users u ON u.id = p.user_id
  JOIN billing.plans pl ON pl.id = p.plan_id;

CREATE VIEW admin.plan_view AS
  SELECT pl.id, pl.code, pl.name, pl.tier, pl.app_code, pl.billing_period, pl.price_usd, pl.is_active,
         coalesce((SELECT array_agg(pa.app_code ORDER BY pa.app_code) FROM billing.plan_apps pa WHERE pa.plan_id = pl.id), '{}') AS unlocks,
         (SELECT count(*)::int FROM billing.purchases p WHERE p.plan_id = pl.id AND p.status IN ('active', 'grace_period')) AS active_purchases,
         pl.created_at, pl.updated_at
  FROM billing.plans pl;

-- The audit log with the actor's email. Rows are append-only; the view exists for reads.
CREATE VIEW admin.audit_log_view AS
  SELECT a.id, a.resource, a.action, a.record_ids, a.actor_id, u.email AS actor_email, a.request_id, a.details,
         a.created_at, a.created_at AS updated_at
  FROM admin.audit_logs a
  LEFT JOIN identity.users u ON u.id = a.actor_id;
