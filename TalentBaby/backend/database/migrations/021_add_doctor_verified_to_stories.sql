-- Migration: Add doctor_verified column to bedtime_stories
-- Also add new story theme categories

ALTER TABLE bedtime_stories ADD COLUMN IF NOT EXISTS doctor_verified BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_bedtime_stories_doctor_verified ON bedtime_stories(doctor_verified);

-- Add new story theme categories
INSERT INTO story_categories (name, description) VALUES
    ('Nice', 'Stories about kindness, sharing, and helping others'),
    ('Smart', 'Stories that inspire curiosity, problem-solving, and creativity'),
    ('Famous', 'Stories inspired by famous people and their childhood journeys'),
    ('Tidy', 'Stories about cleanliness, organization, and neatness'),
    ('Discipline', 'Stories about routines, persistence, and self-control')
ON CONFLICT (name) DO NOTHING;
