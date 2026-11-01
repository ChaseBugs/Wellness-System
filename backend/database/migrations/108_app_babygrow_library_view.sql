-- BabyGrow admin: read model over BabyGrow's Content Factory items that lifts the attributes the
-- TalentBaby web-admin filters and sorts on (age window, sub-category, recipe slots) into columns.
-- Writes still go to content.items; `attributes` stays the source of truth.
CREATE VIEW babygrow.library_admin_view AS
  SELECT i.id, i.content_type, i.app_codes, i.title, i.summary, i.body, i.category, i.tags, i.duration_minutes,
         i.steps, i.media, i.attributes, i.locale, i.is_premium, i.review_status, i.expert_reviewed,
         i.source_ref, i.published_at, i.created_at, i.updated_at,
         CASE WHEN i.attributes->>'ageMonthsMin' ~ '^\d+(\.\d+)?$' THEN (i.attributes->>'ageMonthsMin')::numeric::int END AS age_months_min,
         CASE WHEN i.attributes->>'ageMonthsMax' ~ '^\d+(\.\d+)?$' THEN (i.attributes->>'ageMonthsMax')::numeric::int END AS age_months_max,
         i.attributes->>'subCategory' AS sub_category,
         i.attributes->>'target' AS target,
         i.attributes->>'ageGroup' AS age_group,
         i.attributes->>'mealSlot' AS meal_slot,
         i.attributes->>'author' AS author
  FROM content.items i
  WHERE 'babygrow' = ANY(i.app_codes);
