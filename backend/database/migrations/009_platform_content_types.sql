-- Content Factory: types needed by the TalentBaby (BabyGrow) library, plus a stable reference for imports.
ALTER TABLE content.items DROP CONSTRAINT items_content_type_check;
ALTER TABLE content.items ADD CONSTRAINT items_content_type_check CHECK (content_type IN (
  'recipe', 'exercise_guide', 'yoga_pose', 'article', 'tutorial', 'meditation_audio', 'milestone_guide',
  'activity', 'daily_update', 'story', 'guide'
));

-- e.g. "talentbaby:activities:123": lets legacy imports upsert instead of duplicating.
ALTER TABLE content.items ADD COLUMN source_ref text;
CREATE UNIQUE INDEX content_items_source_ref_idx ON content.items (source_ref) WHERE source_ref IS NOT NULL;
CREATE INDEX content_items_type_category_idx ON content.items (content_type, category);
