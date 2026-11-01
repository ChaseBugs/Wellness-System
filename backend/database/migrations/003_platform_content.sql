-- Content Factory: one CMS for recipes, exercise guides, articles, tutorials and audio across all apps.
-- Shared fields are columns; category-specific data (nutrition, allergens, safety notes) lives in `attributes`.
CREATE SCHEMA IF NOT EXISTS content;

CREATE TABLE content.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN (
    'recipe', 'exercise_guide', 'yoga_pose', 'article', 'tutorial', 'meditation_audio', 'milestone_guide'
  )),
  title text NOT NULL,
  summary text,
  body text,
  app_codes text[] NOT NULL CHECK (cardinality(app_codes) > 0),
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  difficulty text CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'advanced')),
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  media jsonb NOT NULL DEFAULT '{}'::jsonb,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  locale text NOT NULL DEFAULT 'en',
  is_premium boolean NOT NULL DEFAULT false,
  -- Mirrors Foodvisor's doctor_verified rule: new content always starts as an unreviewed draft.
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  expert_reviewed boolean NOT NULL DEFAULT false,
  review_notes text,
  reviewed_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  search tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(category, ''))
  ) STORED
);
CREATE INDEX content_items_apps_idx ON content.items USING gin (app_codes);
CREATE INDEX content_items_tags_idx ON content.items USING gin (tags);
CREATE INDEX content_items_search_idx ON content.items USING gin (search);
CREATE INDEX content_items_type_status_idx ON content.items (content_type, review_status);
