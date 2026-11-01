import { defineResource, type FieldSpec, type ResourceDefinition } from "../../../../shared/resource-kit/resource-definition.js";

/**
 * Admin resources for the TalentBaby web-admin.
 *
 * Library content lives in the Content Factory (content.items) scoped to BabyGrow. It keeps TalentBaby's
 * behaviour: items are visible as soon as they are created and carry an "expert reviewed" badge that
 * only admins can set (`expertReviewed`, the review field), instead of Foodvisor's review-before-publish
 * workflow. Revisit if BabyGrow content should move to review-first publishing.
 *
 * Reads go through babygrow.library_admin_view, which lifts the attributes the admin filters on into
 * read-only columns (e.g. `?ageMonthsMin_lte=9&ageMonthsMax_gte=9&subCategory=Gross Motor`).
 * Writes send the whole `attributes` object.
 */
const contentFields: Record<string, FieldSpec> = {
  title: { column: "title", type: "text", required: true },
  summary: { column: "summary", type: "text" },
  body: { column: "body", type: "text" },
  category: { column: "category", type: "text" },
  tags: { column: "tags", type: "textArray" },
  durationMinutes: { column: "duration_minutes", type: "integer" },
  steps: { column: "steps", type: "json" },
  media: { column: "media", type: "json" },
  attributes: { column: "attributes", type: "json" },
  locale: { column: "locale", type: "text" },
  isPremium: { column: "is_premium", type: "boolean" },
  reviewStatus: { column: "review_status", type: "text", enum: ["published", "archived"] },
  expertReviewed: { column: "expert_reviewed", type: "boolean" },
  sourceRef: { column: "source_ref", type: "text", readOnly: true },
  publishedAt: { column: "published_at", type: "timestamp", readOnly: true },
  ageMonthsMin: { column: "age_months_min", type: "integer", readOnly: true },
  ageMonthsMax: { column: "age_months_max", type: "integer", readOnly: true },
  subCategory: { column: "sub_category", type: "text", readOnly: true },
  target: { column: "target", type: "text", readOnly: true },
  ageGroup: { column: "age_group", type: "text", readOnly: true },
  mealSlot: { column: "meal_slot", type: "text", readOnly: true },
  author: { column: "author", type: "text", readOnly: true }
};

function libraryResource(name: string, contentType: string): ResourceDefinition {
  return defineResource({
    name,
    table: "content.items",
    view: "babygrow.library_admin_view",
    scope: [
      { column: "content_type", equals: contentType },
      { column: "app_codes", contains: "babygrow" }
    ],
    createDefaults: { content_type: contentType, app_codes: ["babygrow"], review_status: "published" },
    fields: contentFields,
    searchFields: ["title", "summary", "category", "tags", "subCategory", "author"],
    filterFields: ["category", "isPremium", "expertReviewed", "reviewStatus", "ageMonthsMin", "ageMonthsMax", "subCategory", "target", "ageGroup", "mealSlot"],
    sortFields: ["title", "category", "durationMinutes", "ageMonthsMin"],
    defaultSort: "-createdAt",
    reviewField: "expertReviewed",
    labelField: "title",
    maxLimit: 500
  });
}

export const activitiesResource = libraryResource("activities", "activity");
export const recipesResource = libraryResource("recipes", "recipe");
export const storiesResource = libraryResource("stories", "story");
export const articlesResource = libraryResource("articles", "article");
export const dailyUpdatesResource = libraryResource("daily-updates", "daily_update");
export const guidesResource = libraryResource("guides", "guide");

export const milestoneDefinitionsResource = defineResource({
  name: "milestone-definitions",
  table: "babygrow.milestone_definitions",
  fields: {
    month: { column: "month", type: "integer", required: true },
    milestoneType: { column: "domain", type: "text", required: true, enum: ["physical", "cognitive", "communication", "social_emotional"] },
    title: { column: "title", type: "text", required: true },
    description: { column: "description", type: "text" },
    question: { column: "question", type: "text" },
    relatedActivity: { column: "related_activity", type: "text" },
    displayOrder: { column: "display_order", type: "integer" },
    ageMonthsMin: { column: "age_months_min", type: "integer" },
    ageMonthsMax: { column: "age_months_max", type: "integer" },
    source: { column: "source", type: "text" },
    isPublished: { column: "is_published", type: "boolean" },
    expertReviewed: { column: "expert_reviewed", type: "boolean" },
    key: { column: "key", type: "text", readOnly: true }
  },
  searchFields: ["title", "description", "question", "relatedActivity"],
  filterFields: ["month", "milestoneType", "isPublished", "expertReviewed"],
  sortFields: ["month", "milestoneType", "displayOrder", "title"],
  defaultSort: "month",
  reviewField: "expertReviewed",
  labelField: "title",
  maxLimit: 500
});

export const childrenResource = defineResource({
  name: "children",
  table: "babygrow.children",
  view: "babygrow.child_admin_view",
  fields: {
    name: { column: "name", type: "text", required: true },
    birthDate: { column: "birth_date", type: "date", required: true },
    sex: { column: "sex", type: "text", enum: ["female", "male", "unspecified"] },
    birthWeightKg: { column: "birth_weight_kg", type: "number" },
    birthHeightCm: { column: "birth_height_cm", type: "number" },
    avatarUrl: { column: "avatar_url", type: "text" },
    ageMonths: { column: "age_months", type: "integer", readOnly: true },
    ownerEmail: { column: "owner_email", type: "text", readOnly: true },
    ownerName: { column: "owner_name", type: "text", readOnly: true },
    caregiverCount: { column: "caregiver_count", type: "integer", readOnly: true }
  },
  searchFields: ["name", "ownerEmail", "ownerName"],
  filterFields: ["sex"],
  sortFields: ["name", "birthDate", "ageMonths"],
  defaultSort: "-createdAt",
  labelField: "name",
  // Children are created by caregivers in the app.
  operations: { create: false }
});

export const parentsResource = defineResource({
  name: "parents",
  table: "babygrow.parent_profiles",
  view: "babygrow.parent_admin_view",
  fields: {
    email: { column: "email", type: "text", readOnly: true },
    name: { column: "display_name", type: "text", readOnly: true },
    locale: { column: "locale", type: "text", readOnly: true },
    phoneNumber: { column: "phone_number", type: "text", readOnly: true },
    gender: { column: "gender", type: "text", readOnly: true },
    relationToBaby: { column: "relation_to_baby", type: "text", readOnly: true },
    activeChildId: { column: "active_child_id", type: "uuid", readOnly: true },
    childCount: { column: "child_count", type: "integer", readOnly: true }
  },
  searchFields: ["email", "name", "phoneNumber"],
  filterFields: ["relationToBaby"],
  sortFields: ["email", "name", "childCount"],
  defaultSort: "-createdAt",
  labelField: "email",
  // Accounts are managed through identity; the admin only inspects caregivers.
  operations: { create: false, update: false, delete: false }
});

export const BABYGROW_ADMIN_RESOURCES: ResourceDefinition[] = [
  activitiesResource,
  milestoneDefinitionsResource,
  recipesResource,
  storiesResource,
  articlesResource,
  dailyUpdatesResource,
  guidesResource,
  childrenResource,
  parentsResource
];
