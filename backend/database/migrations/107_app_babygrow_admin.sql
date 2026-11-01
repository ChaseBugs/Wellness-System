-- BabyGrow admin (TalentBaby web-admin): defaults so editors can add milestones by month, and read models.
ALTER TABLE babygrow.milestone_definitions
  ALTER COLUMN key SET DEFAULT ('custom-' || gen_random_uuid()),
  ALTER COLUMN source SET DEFAULT 'BabyGrow admin',
  ALTER COLUMN age_months_min SET DEFAULT 0,
  ALTER COLUMN age_months_max SET DEFAULT 72;

CREATE VIEW babygrow.child_admin_view AS
  SELECT c.id, c.name, c.birth_date, c.sex, c.birth_weight_kg, c.birth_height_cm, c.avatar_url,
         (date_part('year', age(current_date, c.birth_date)) * 12 + date_part('month', age(current_date, c.birth_date)))::int AS age_months,
         u.email AS owner_email, u.display_name AS owner_name,
         (SELECT count(*)::int FROM babygrow.caregivers cg WHERE cg.child_id = c.id) AS caregiver_count,
         c.created_at, c.updated_at
  FROM babygrow.children c
  JOIN identity.users u ON u.id = c.created_by;

CREATE VIEW babygrow.parent_admin_view AS
  SELECT u.id, u.email, u.display_name, u.locale, p.phone_number, p.gender, p.relation_to_baby, p.active_child_id,
         (SELECT count(*)::int FROM babygrow.caregivers cg WHERE cg.user_id = u.id) AS child_count,
         coalesce(p.created_at, u.created_at) AS created_at, coalesce(p.updated_at, u.updated_at) AS updated_at
  FROM identity.users u
  LEFT JOIN babygrow.parent_profiles p ON p.user_id = u.id
  WHERE p.user_id IS NOT NULL OR EXISTS (SELECT 1 FROM babygrow.caregivers cg WHERE cg.user_id = u.id);
