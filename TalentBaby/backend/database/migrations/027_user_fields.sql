-- Migration 027: Add is_premium and relation_to_baby to users table
-- Also documents the supported role values including 'agent'

-- Premium subscription flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Relation of the user to their baby (e.g. 'mother', 'father', 'guardian', 'grandparent')
-- Only relevant for role = 'user'; null for doctor / agent / admin accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS relation_to_baby VARCHAR(50);

-- Supported role values: 'user', 'doctor', 'agent', 'admin'
-- (role column already exists from migration 002)
COMMENT ON COLUMN users.role IS 'Supported values: user, doctor, agent, admin';
