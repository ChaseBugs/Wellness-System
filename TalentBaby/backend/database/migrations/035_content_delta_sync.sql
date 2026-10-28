-- Migration 035: Public content delta sync metadata
-- Keeps PostgreSQL as the master content store while mobile clients cache
-- changed rows and assets for offline use.

CREATE TABLE IF NOT EXISTS content_delete_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_id INTEGER NOT NULL,
  deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_content_delete_log_since
  ON content_delete_log(table_name, deleted_at);

CREATE OR REPLACE FUNCTION log_content_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_delete_log (table_name, row_id, payload)
  VALUES (TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'activities',
    'articles',
    'bedtime_stories',
    'daily_updates_content',
    'milestone_definitions',
    'nutrition_categories',
    'nutrition_foods',
    'recipes',
    'talent_categories'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = target_table
    ) THEN
      EXECUTE format(
        'DROP TRIGGER IF EXISTS %I ON %I',
        'trg_' || target_table || '_content_delete',
        target_table
      );
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE DELETE ON %I FOR EACH ROW EXECUTE FUNCTION log_content_delete()',
        'trg_' || target_table || '_content_delete',
        target_table
      );
    END IF;
  END LOOP;
END $$;
