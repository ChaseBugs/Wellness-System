-- Migration 014: Add language column to all translatable content tables
-- Strategy: Option 2 — language-tagged rows (EN + KO stored side by side)
-- Default all existing rows to 'en'.

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE nutrition_foods
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE nutrition_categories
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE bedtime_stories
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE expert_classes
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE daily_updates_content
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE feeding_guides
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE sleep_guides
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE nutrition_guides
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS language CHAR(2) NOT NULL DEFAULT 'en';

-- Indexes for fast language filtering
CREATE INDEX IF NOT EXISTS idx_activities_lang         ON activities(language);
CREATE INDEX IF NOT EXISTS idx_recipes_lang            ON recipes(language);
CREATE INDEX IF NOT EXISTS idx_articles_lang           ON articles(language);
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_lang    ON nutrition_foods(language);
CREATE INDEX IF NOT EXISTS idx_nutrition_cats_lang     ON nutrition_categories(language);
CREATE INDEX IF NOT EXISTS idx_bedtime_stories_lang    ON bedtime_stories(language);
CREATE INDEX IF NOT EXISTS idx_expert_classes_lang     ON expert_classes(language);
CREATE INDEX IF NOT EXISTS idx_daily_updates_lang      ON daily_updates_content(language);
CREATE INDEX IF NOT EXISTS idx_feeding_guides_lang     ON feeding_guides(language);
CREATE INDEX IF NOT EXISTS idx_sleep_guides_lang       ON sleep_guides(language);
CREATE INDEX IF NOT EXISTS idx_nutrition_guides_lang   ON nutrition_guides(language);
CREATE INDEX IF NOT EXISTS idx_materials_lang          ON materials(language);
