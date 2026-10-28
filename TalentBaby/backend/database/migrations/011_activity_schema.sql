-- Migration 011: Activity schema updates
-- Adds sub_category, benefits, frequency, month range, done_count, is_premium to activities
-- Adds difficulty_feedback, milestone_saved to baby_activities

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS benefits TEXT[],
  ADD COLUMN IF NOT EXISTS frequency TEXT,
  ADD COLUMN IF NOT EXISTS month_min INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS month_max INTEGER DEFAULT 36,
  ADD COLUMN IF NOT EXISTS done_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

ALTER TABLE baby_activities
  ADD COLUMN IF NOT EXISTS difficulty_feedback VARCHAR(20),
  ADD COLUMN IF NOT EXISTS milestone_saved BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_activities_month ON activities(month_min, month_max);
