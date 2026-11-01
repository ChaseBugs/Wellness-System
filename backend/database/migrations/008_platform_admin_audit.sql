-- Audit trail for every admin write made through the Resource kit (replaces Foodvisor's auditLog middleware).
CREATE SCHEMA IF NOT EXISTS admin;

CREATE TABLE admin.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  resource text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'bulk-verify', 'bulk-delete', 'custom')),
  record_ids text[] NOT NULL DEFAULT '{}',
  actor_id uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  request_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_resource_time_idx ON admin.audit_logs (resource, created_at DESC);
