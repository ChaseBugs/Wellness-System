-- Migration 006: Add active_baby_id to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_baby_id INTEGER REFERENCES babies(id) ON DELETE SET NULL;
