-- Migration 023: Add wisdom & insights fields to articles table
-- Adds doctor vetting info and age-range filtering to support the
-- Wisdom & Insights feature as seen in the BabyG UI design.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS doctor_name        VARCHAR(255),
  ADD COLUMN IF NOT EXISTS doctor_credentials VARCHAR(255),
  ADD COLUMN IF NOT EXISTS age_min_months     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS age_max_months     INTEGER DEFAULT 60;

-- Index for age-range queries (mobile filtering by baby age)
CREATE INDEX IF NOT EXISTS idx_articles_age_range
  ON articles(age_min_months, age_max_months);
