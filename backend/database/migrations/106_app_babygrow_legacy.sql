-- BabyGrow: everything the TalentBaby app needs on top of 101 (migration from the legacy TalentBaby backend).

-- 1. Child profile fields shown in the app.
ALTER TABLE babygrow.children
  ADD COLUMN birth_weight_kg numeric(4, 2) CHECK (birth_weight_kg IS NULL OR birth_weight_kg BETWEEN 0.3 AND 8),
  ADD COLUMN birth_height_cm numeric(4, 1) CHECK (birth_height_cm IS NULL OR birth_height_cm BETWEEN 20 AND 70),
  ADD COLUMN avatar_url text;

-- 2. Caregiver (parent) profile: app-specific personal details and the child shown by default.
CREATE TABLE babygrow.parent_profiles (
  user_id uuid PRIMARY KEY REFERENCES identity.users (id) ON DELETE CASCADE,
  phone_number text,
  gender text CHECK (gender IS NULL OR gender IN ('female', 'male', 'other', 'prefer_not_to_say')),
  birthdate date,
  avatar_url text,
  relation_to_baby text,
  active_child_id uuid REFERENCES babygrow.children (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Milestones: adopt the TalentBaby vocabulary (the only consumer) and the yes/almost/no checklist.
ALTER TABLE babygrow.milestone_definitions DROP CONSTRAINT milestone_definitions_domain_check;
UPDATE babygrow.milestone_definitions SET domain = CASE domain
  WHEN 'motor' THEN 'physical' WHEN 'language' THEN 'communication' WHEN 'social' THEN 'social_emotional' ELSE domain END;
ALTER TABLE babygrow.milestone_definitions ADD CONSTRAINT milestone_definitions_domain_check
  CHECK (domain IN ('physical', 'cognitive', 'communication', 'social_emotional'));
ALTER TABLE babygrow.milestone_definitions
  ADD COLUMN month integer CHECK (month IS NULL OR month BETWEEN 1 AND 72),
  ADD COLUMN question text,
  ADD COLUMN related_activity text,
  ADD COLUMN display_order integer NOT NULL DEFAULT 0,
  -- Visible to families. Imported legacy items are published but not yet expert reviewed (as they were in TalentBaby).
  ADD COLUMN is_published boolean NOT NULL DEFAULT false;
UPDATE babygrow.milestone_definitions SET is_published = expert_reviewed;
CREATE INDEX milestone_definitions_month_idx ON babygrow.milestone_definitions (month, domain, display_order);

ALTER TABLE babygrow.milestone_checks
  ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  ADD COLUMN status text NOT NULL DEFAULT 'yes' CHECK (status IN ('yes', 'almost', 'no')),
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ALTER COLUMN achieved_on DROP NOT NULL;

-- 4. Activity library usage (activities themselves are content.items of type 'activity').
CREATE TABLE babygrow.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES babygrow.children (id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES content.items (id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  rating smallint CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  difficulty_feedback text CHECK (difficulty_feedback IS NULL OR difficulty_feedback IN ('too_easy', 'just_right', 'too_hard')),
  notes text,
  recorded_by uuid REFERENCES identity.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_child_idx ON babygrow.activity_logs (child_id, completed_at DESC);
CREATE INDEX activity_logs_content_idx ON babygrow.activity_logs (content_id);

-- Four age-appropriate activities per child per day (one per development area).
CREATE TABLE babygrow.daily_activity_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES babygrow.children (id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  slot smallint NOT NULL CHECK (slot BETWEEN 1 AND 4),
  content_id uuid NOT NULL REFERENCES content.items (id) ON DELETE CASCADE,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, plan_date, slot)
);

-- 5. Saved library items (recipe favourites, article and story bookmarks).
CREATE TABLE babygrow.bookmarks (
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES content.items (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);
