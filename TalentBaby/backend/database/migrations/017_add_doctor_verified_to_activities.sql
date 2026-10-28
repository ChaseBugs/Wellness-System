-- Migration 017: Add doctor_verified flag to activities
-- Initial seed activities are unverified by default (false)

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS doctor_verified boolean NOT NULL DEFAULT false;

-- Verify
SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE doctor_verified = false) as unverified FROM activities;
