import { defineResource, type FieldSpec, type ResourceDefinition } from "../../../../shared/resource-kit/resource-definition.js";

/**
 * Admin resources for the HeightIncrease web-admin. API field names match the legacy Mongo documents
 * (camelCase plus `doctor_verified` and `setup`) so the config-driven admin maps 1:1.
 *
 * Exercises and training plans live in the shared Routine Engine, where going live needs an expert
 * sign-off: here `doctor_verified` and `isActive` are read-only, every edit sends the item back to draft,
 * and review/publish use POST /routine/{exercises|routines}/:id/{review|publish}.
 * Articles are BabyGrow-style Content Factory items: live on create, with an admin-only review badge.
 */
const APP = "height-increase";

const routineFlags: Record<string, FieldSpec> = {
  doctor_verified: { column: "expert_reviewed", type: "boolean", readOnly: true },
  status: { column: "status", type: "text", readOnly: true },
  isActive: { column: "(status = 'published')", type: "boolean", readOnly: true },
  setup: { column: "attributes", jsonKey: "setup", type: "boolean" },
  sortOrder: { column: "attributes", jsonKey: "sortOrder", type: "integer" }
};

/** Editing Routine Engine content withdraws it until it is reviewed and published again. */
const backToDraft = ["status = CASE WHEN status = 'archived' THEN status ELSE 'draft' END", "expert_reviewed = false"];

export const exercisesResource = defineResource({
  name: "exercises",
  table: "routine.exercises",
  scope: [{ column: "app_codes", contains: APP }],
  createDefaults: { app_codes: [APP], status: "draft" },
  updateSideEffects: backToDraft,
  fields: {
    title: { column: "name", type: "text", required: true },
    description: { column: "description", type: "text" },
    slug: { column: "attributes", jsonKey: "slug", type: "text" },
    category: {
      column: "attributes",
      jsonKey: "category",
      type: "text",
      enum: ["stretching", "posture", "strength", "cardio", "yoga", "warmup", "custom"]
    },
    durationSeconds: { column: "default_duration_seconds", type: "integer" },
    calories: { column: "attributes", jsonKey: "calories", type: "number" },
    difficulty: { column: "difficulty", type: "text", enum: ["beginner", "intermediate", "advanced"] },
    ageGroup: { column: "attributes", jsonKey: "ageGroup", type: "text" },
    imageUrl: { column: "media", jsonKey: "imageUrl", type: "text" },
    videoUrl: { column: "media", jsonKey: "videoUrl", type: "text" },
    equipment: { column: "attributes", jsonKey: "equipment", type: "json" },
    targetAreas: { column: "body_areas", type: "textArray" },
    steps: { column: "attributes", jsonKey: "steps", type: "json" },
    tips: { column: "attributes", jsonKey: "tips", type: "json" },
    safetyNotes: { column: "safety_notes", type: "textArray" },
    ...routineFlags
  },
  searchFields: ["title", "category", "description"],
  filterFields: ["category", "difficulty", "status", "doctor_verified"],
  sortFields: ["title", "sortOrder", "durationSeconds", "category"],
  defaultSort: "sortOrder",
  labelField: "title",
  maxLimit: 500
});

/** The plan's exercises in legacy shape, read from routine_steps (written by the training-plans routes). */
const PLAN_EXERCISES = `(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'exercise', s.exercise_id, 'title', e.name, 'order', s.position, 'durationSeconds', s.duration_seconds,
    'reps', s.reps, 'sets', s.sets, 'restSeconds', s.rest_seconds) ORDER BY s.position), '[]'::jsonb)
  FROM routine.routine_steps s JOIN routine.exercises e ON e.id = s.exercise_id
  WHERE s.routine_id = routine.routines.id)`;

export const trainingPlansResource = defineResource({
  name: "training-plans",
  table: "routine.routines",
  scope: [{ column: "app_code", equals: APP }],
  createDefaults: { app_code: APP, status: "draft" },
  updateSideEffects: backToDraft,
  fields: {
    title: { column: "title", type: "text", required: true },
    subtitle: { column: "attributes", jsonKey: "subtitle", type: "text" },
    description: { column: "description", type: "text" },
    level: { column: "level", type: "text", enum: ["beginner", "intermediate", "advanced"] },
    type: { column: "attributes", jsonKey: "type", type: "text", enum: ["featured", "daily", "weekly", "custom-template"] },
    bannerImageUrl: { column: "attributes", jsonKey: "bannerImageUrl", type: "text" },
    icon: { column: "attributes", jsonKey: "icon", type: "text" },
    estimatedMinutes: { column: "estimated_minutes", type: "integer" },
    goal: { column: "goal", type: "text" },
    exercises: { column: PLAN_EXERCISES, type: "json", readOnly: true },
    tags: { column: "tags", type: "textArray" },
    isPremium: { column: "is_premium", type: "boolean" },
    ...routineFlags
  },
  searchFields: ["title", "subtitle", "description"],
  filterFields: ["level", "type", "status", "isPremium", "doctor_verified"],
  sortFields: ["title", "sortOrder", "estimatedMinutes", "level"],
  defaultSort: "sortOrder",
  labelField: "title",
  maxLimit: 500
});

export const articlesResource = defineResource({
  name: "articles",
  table: "content.items",
  scope: [
    { column: "content_type", equals: "article" },
    { column: "app_codes", contains: APP }
  ],
  createDefaults: { content_type: "article", app_codes: [APP], review_status: "published" },
  fields: {
    title: { column: "title", type: "text", required: true },
    slug: { column: "attributes", jsonKey: "slug", type: "text" },
    category: {
      column: "category",
      type: "text",
      enum: ["nutrition", "sleep", "height-tips", "reports", "fashion", "motivation", "general"]
    },
    excerpt: { column: "summary", type: "text" },
    body: { column: "body", type: "text", required: true },
    imageUrl: { column: "media", jsonKey: "imageUrl", type: "text" },
    authorName: { column: "attributes", jsonKey: "author", type: "text" },
    readMinutes: { column: "duration_minutes", type: "integer" },
    tags: { column: "tags", type: "textArray" },
    doctor_verified: { column: "expert_reviewed", type: "boolean" },
    setup: { column: "attributes", jsonKey: "setup", type: "boolean" },
    isFeatured: { column: "attributes", jsonKey: "isFeatured", type: "boolean" },
    likesCount: { column: "attributes", jsonKey: "likesCount", type: "integer", readOnly: true },
    // published (live) or archived (hidden); `isPublished` mirrors it for the legacy columns.
    reviewStatus: { column: "review_status", type: "text", enum: ["published", "archived"] },
    isPublished: { column: "(review_status = 'published')", type: "boolean", readOnly: true },
    publishedAt: { column: "published_at", type: "timestamp", readOnly: true }
  },
  searchFields: ["title", "excerpt", "body"],
  filterFields: ["category", "reviewStatus", "doctor_verified", "isFeatured"],
  sortFields: ["title", "category", "readMinutes"],
  defaultSort: "-createdAt",
  reviewField: "doctor_verified",
  labelField: "title",
  maxLimit: 500
});

export const usersResource = defineResource({
  name: "users",
  table: "height.profiles",
  view: "height.user_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", readOnly: true },
    name: { column: "display_name", type: "text", readOnly: true },
    email: { column: "email", type: "text", readOnly: true },
    role: { column: "role", type: "text", readOnly: true },
    status: { column: "status", type: "text", enum: ["active", "blocked"] },
    streakDays: { column: "streak_days", type: "integer" },
    points: { column: "points", type: "integer" },
    targetHeightCm: { column: "target_height_cm", type: "number" },
    birthDate: { column: "birth_date", type: "date" },
    gender: { column: "gender", type: "text", enum: ["male", "female", "other", "prefer_not_to_say"] },
    units: { column: "units", type: "text", enum: ["metric", "imperial"] },
    notificationsEnabled: { column: "notifications_enabled", type: "boolean" },
    avatarUrl: { column: "avatar_url", type: "text" },
    currentHeightCm: { column: "current_height_cm", type: "number", readOnly: true },
    weightKg: { column: "weight_kg", type: "number", readOnly: true },
    lastMeasuredOn: { column: "last_measured_on", type: "date", readOnly: true }
  },
  searchFields: ["name", "email"],
  filterFields: ["status", "gender", "role"],
  sortFields: ["name", "email", "streakDays", "points"],
  defaultSort: "-createdAt",
  labelField: "email",
  // Accounts come from sign-up and are shared across apps; the admin edits the HeightIncrease profile.
  operations: { create: false, delete: false }
});

export const logsResource = defineResource({
  name: "logs",
  table: "height.daily_logs",
  view: "height.log_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", required: true },
    userEmail: { column: "user_email", type: "text", readOnly: true },
    date: { column: "log_date", type: "date", required: true },
    heightCm: { column: "height_cm", type: "number" },
    weightKg: { column: "weight_kg", type: "number" },
    sleepHours: { column: "sleep_hours", type: "number" },
    waterGlasses: { column: "water_glasses", type: "integer" },
    mood: { column: "mood", type: "text", enum: ["great", "good", "okay", "tired", "bad"] },
    workoutMinutes: { column: "workout_minutes", type: "integer" },
    completedExercises: { column: "completed_exercises", type: "json" },
    notes: { column: "notes", type: "text" }
  },
  searchFields: ["userEmail", "notes"],
  filterFields: ["userId", "mood", "date"],
  sortFields: ["date", "workoutMinutes", "sleepHours"],
  defaultSort: "-date",
  labelField: "userEmail",
  maxLimit: 500
});

export const goalsResource = defineResource({
  name: "goals",
  table: "height.goals",
  view: "height.goal_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", required: true },
    userEmail: { column: "user_email", type: "text", readOnly: true },
    title: { column: "title", type: "text", required: true },
    type: { column: "goal_type", type: "text", enum: ["height", "weight", "workout", "sleep", "custom"] },
    targetValue: { column: "target_value", type: "number" },
    currentValue: { column: "current_value", type: "number" },
    unit: { column: "unit", type: "text" },
    startsAt: { column: "starts_at", type: "timestamp" },
    dueAt: { column: "due_at", type: "timestamp" },
    status: { column: "status", type: "text", enum: ["active", "completed", "cancelled"] }
  },
  searchFields: ["title", "userEmail"],
  filterFields: ["userId", "type", "status"],
  sortFields: ["title", "dueAt", "status"],
  defaultSort: "-createdAt",
  labelField: "title"
});

export const bannersResource = defineResource({
  name: "banners",
  table: "height.banners",
  fields: {
    title: { column: "title", type: "text", required: true },
    subtitle: { column: "subtitle", type: "text" },
    placement: { column: "placement", type: "text", enum: ["home-top", "home-card", "reports-top", "modal", "discover"] },
    imageUrl: { column: "image_url", type: "text" },
    icon: { column: "icon", type: "text" },
    ctaLabel: { column: "cta_label", type: "text" },
    ctaUrl: { column: "cta_url", type: "text" },
    backgroundColor: { column: "background_color", type: "text" },
    startsAt: { column: "starts_at", type: "timestamp" },
    endsAt: { column: "ends_at", type: "timestamp" },
    setup: { column: "setup", type: "boolean" },
    priority: { column: "priority", type: "integer" },
    isActive: { column: "is_active", type: "boolean" }
  },
  searchFields: ["title", "subtitle", "placement"],
  filterFields: ["placement", "isActive"],
  sortFields: ["title", "priority", "placement"],
  defaultSort: "-priority",
  labelField: "title"
});

export const notificationsResource = defineResource({
  name: "notifications",
  table: "height.notifications",
  fields: {
    title: { column: "title", type: "text", required: true },
    message: { column: "message", type: "text", required: true },
    audience: { column: "audience", type: "text", enum: ["all", "free", "premium", "inactive"] },
    type: { column: "notification_type", type: "text", enum: ["motivation", "reminder", "update", "promotion"] },
    scheduledAt: { column: "scheduled_at", type: "timestamp" },
    sentAt: { column: "sent_at", type: "timestamp", readOnly: true },
    setup: { column: "setup", type: "boolean" },
    isActive: { column: "is_active", type: "boolean" }
  },
  searchFields: ["title", "message"],
  filterFields: ["audience", "type", "isActive"],
  sortFields: ["title", "scheduledAt"],
  defaultSort: "-createdAt",
  labelField: "title"
});

export const settingsResource = defineResource({
  name: "settings",
  table: "height.settings",
  fields: {
    key: { column: "key", type: "text", required: true },
    value: { column: "value", type: "json", required: true },
    setup: { column: "setup", type: "boolean" },
    description: { column: "description", type: "text" }
  },
  searchFields: ["key", "description"],
  filterFields: ["setup"],
  sortFields: ["key"],
  defaultSort: "key",
  labelField: "key"
});

export const HEIGHT_ADMIN_RESOURCES: ResourceDefinition[] = [
  usersResource,
  exercisesResource,
  trainingPlansResource,
  articlesResource,
  bannersResource,
  notificationsResource,
  goalsResource,
  logsResource,
  settingsResource
];
