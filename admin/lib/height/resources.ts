import { platformFetch, type ResourceColumn, type ResourceField } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import type { RowAction } from "@/components/ResourceManager";
import type { FilterDef } from "@/lib/foodvisor/resourceConfigs";

/**
 * HeightIncrease admin resources (/apps/height-increase/admin/{endpoint}), ported from
 * HeightIncrease/web-admin. Field names match the platform API (legacy names: doctor_verified, setup).
 */
export type HeightResource = {
  title: string;
  description: string;
  endpoint: string;
  searchPlaceholder: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
  filters?: FilterDef[];
  canCreate?: boolean;
  canDelete?: boolean;
  /** Routine Engine base path for review/publish actions (exercises and plans only). */
  routinePath?: "/routine/exercises" | "/routine/routines";
};

const options = (values: string[]) => values.map((value) => ({ value, label: value }));

/**
 * Exercises and plans go live only through the Routine Engine's expert workflow: an admin approves
 * the review, then anyone with editor access publishes. Editing a live item sends it back to draft.
 */
export function routineActions(routinePath: string): RowAction[] {
  const post = (id: unknown, action: string, body?: unknown) =>
    platformFetch(`${routinePath}/${id}/${action}`, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
  return [
    { label: "Approve review", tone: "primary", show: (item) => isAdmin() && !item.doctor_verified && item.status !== "archived", run: (item) => post(item.id, "review", { approve: true }) },
    { label: "Withdraw review", show: (item) => isAdmin() && Boolean(item.doctor_verified), run: (item) => post(item.id, "review", { approve: false }) },
    { label: "Publish", tone: "primary", show: (item) => Boolean(item.doctor_verified) && item.status === "draft", run: (item) => post(item.id, "publish") },
    { label: "Archive", tone: "danger", show: (item) => item.status !== "archived", run: (item) => post(item.id, "archive") }
  ];
}

const statusFilter: FilterDef = { type: "select", key: "status", label: "Status", options: options(["draft", "published", "archived"]) };

export const heightResources: Record<string, HeightResource> = {
  users: {
    title: "Users",
    description: "HeightIncrease profiles. Accounts come from sign-up and are shared across apps; blocking only affects HeightIncrease.",
    endpoint: "/users",
    searchPlaceholder: "Search name or email",
    canCreate: false,
    canDelete: false,
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
      { key: "currentHeightCm", label: "Height cm" },
      { key: "targetHeightCm", label: "Target cm" },
      { key: "streakDays", label: "Streak" },
      { key: "points", label: "Points" },
      { key: "createdAt", label: "Joined", kind: "date" }
    ],
    fields: [
      { name: "status", label: "Status", type: "select", options: ["active", "blocked"], required: true },
      { name: "streakDays", label: "Streak Days", type: "number" },
      { name: "points", label: "Points", type: "number" },
      { name: "targetHeightCm", label: "Target Height cm", type: "number" },
      { name: "birthDate", label: "Birth Date", type: "date" },
      { name: "gender", label: "Gender", type: "select", options: ["male", "female", "other", "prefer_not_to_say"] },
      { name: "units", label: "Units", type: "select", options: ["metric", "imperial"] },
      { name: "notificationsEnabled", label: "Notifications", type: "boolean" },
      { name: "avatarUrl", label: "Avatar URL", type: "text" }
    ],
    filters: [{ type: "select", key: "status", label: "Status", options: options(["active", "blocked"]) }]
  },
  exercises: {
    title: "Exercises",
    description: "Routine Engine exercises for HeightIncrease. They reach the app after an expert review and publish.",
    endpoint: "/exercises",
    searchPlaceholder: "Search exercises",
    routinePath: "/routine/exercises",
    columns: [
      { key: "imageUrl", label: "Image", kind: "image" },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "durationSeconds", label: "Seconds" },
      { key: "difficulty", label: "Difficulty" },
      { key: "status", label: "Status" },
      { key: "doctor_verified", label: "Reviewed", kind: "boolean" },
      { key: "isActive", label: "Live", kind: "boolean" }
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["stretching", "posture", "strength", "cardio", "yoga", "warmup", "custom"], required: true },
      { name: "durationSeconds", label: "Duration Seconds", type: "number", required: true },
      { name: "calories", label: "Calories", type: "number" },
      { name: "difficulty", label: "Difficulty", type: "select", options: ["beginner", "intermediate", "advanced"], required: true },
      { name: "ageGroup", label: "Age Group", type: "text" },
      { name: "imageUrl", label: "Image URL", type: "text" },
      { name: "videoUrl", label: "Video URL", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "equipment", label: "Equipment", type: "tags" },
      { name: "targetAreas", label: "Target Areas", type: "tags" },
      { name: "steps", label: "Steps (JSON list)", type: "textarea" },
      { name: "tips", label: "Tips (JSON list)", type: "textarea" },
      { name: "safetyNotes", label: "Safety Notes", type: "tags" },
      { name: "setup", label: "Setup Complete", type: "boolean" },
      { name: "sortOrder", label: "Sort Order", type: "number" }
    ],
    filters: [statusFilter, { type: "select", key: "category", label: "Category", options: options(["stretching", "posture", "strength", "cardio", "yoga", "warmup", "custom"]) }]
  },
  "training-plans": {
    title: "Training Plans",
    description: "Routine Engine plans. Publishing needs an expert review and every exercise in the plan published.",
    endpoint: "/training-plans",
    searchPlaceholder: "Search plans",
    routinePath: "/routine/routines",
    columns: [
      { key: "title", label: "Title" },
      { key: "level", label: "Level" },
      { key: "type", label: "Type" },
      { key: "estimatedMinutes", label: "Minutes" },
      { key: "exercises", label: "Exercises" },
      { key: "status", label: "Status" },
      { key: "doctor_verified", label: "Reviewed", kind: "boolean" },
      { key: "isPremium", label: "Premium", kind: "boolean" }
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "level", label: "Level", type: "select", options: ["beginner", "intermediate", "advanced"], required: true },
      { name: "type", label: "Type", type: "select", options: ["featured", "daily", "weekly", "custom-template"], required: true },
      { name: "bannerImageUrl", label: "Banner Image URL", type: "text" },
      { name: "icon", label: "Icon", type: "text" },
      { name: "estimatedMinutes", label: "Estimated Minutes", type: "number" },
      { name: "goal", label: "Goal", type: "text" },
      // JSON list of { exercise: <exercise id>, order, durationSeconds, sets, reps, restSeconds }.
      { name: "exercises", label: "Exercises (JSON)", type: "textarea" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "setup", label: "Setup Complete", type: "boolean" },
      { name: "isPremium", label: "Premium", type: "boolean" },
      { name: "sortOrder", label: "Sort Order", type: "number" }
    ],
    filters: [statusFilter, { type: "select", key: "level", label: "Level", options: options(["beginner", "intermediate", "advanced"]) }]
  },
  articles: {
    title: "Articles",
    description: "HeightIncrease articles in the Content Factory. Live on create; only admins change the review flag.",
    endpoint: "/articles",
    searchPlaceholder: "Search articles",
    columns: [
      { key: "imageUrl", label: "Image", kind: "image" },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "readMinutes", label: "Minutes" },
      { key: "isFeatured", label: "Featured", kind: "boolean" },
      { key: "isPublished", label: "Published", kind: "boolean" },
      { key: "doctor_verified", label: "Reviewed", kind: "boolean" }
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["nutrition", "sleep", "height-tips", "reports", "fashion", "motivation", "general"], required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body", type: "textarea", required: true },
      { name: "imageUrl", label: "Image URL", type: "text" },
      { name: "authorName", label: "Author", type: "text" },
      { name: "readMinutes", label: "Read Minutes", type: "number" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "isFeatured", label: "Featured", type: "boolean" },
      { name: "setup", label: "Setup Complete", type: "boolean" },
      { name: "reviewStatus", label: "Visibility", type: "select", options: ["published", "archived"], required: true }
    ],
    filters: [{ type: "select", key: "reviewStatus", label: "Visibility", options: options(["published", "archived"]) }]
  },
  banners: {
    title: "Banners",
    description: "Home, report and discover banners shown in the app while active.",
    endpoint: "/banners",
    searchPlaceholder: "Search banners",
    columns: [
      { key: "title", label: "Title" },
      { key: "placement", label: "Placement" },
      { key: "priority", label: "Priority" },
      { key: "startsAt", label: "Starts", kind: "date" },
      { key: "endsAt", label: "Ends", kind: "date" },
      { key: "isActive", label: "Active", kind: "boolean" }
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "placement", label: "Placement", type: "select", options: ["home-top", "home-card", "reports-top", "modal", "discover"], required: true },
      { name: "imageUrl", label: "Image URL", type: "text" },
      { name: "icon", label: "Icon", type: "text" },
      { name: "ctaLabel", label: "CTA Label", type: "text" },
      { name: "ctaUrl", label: "CTA URL", type: "text" },
      { name: "backgroundColor", label: "Background Color", type: "text" },
      { name: "startsAt", label: "Starts At", type: "date" },
      { name: "endsAt", label: "Ends At", type: "date" },
      { name: "setup", label: "Setup Complete", type: "boolean" },
      { name: "priority", label: "Priority", type: "number" },
      { name: "isActive", label: "Active", type: "boolean" }
    ]
  },
  notifications: {
    title: "Push campaigns",
    description: "Admin-authored push messages. Stored for delivery; the push sender is not built yet.",
    endpoint: "/notifications",
    searchPlaceholder: "Search campaigns",
    columns: [
      { key: "title", label: "Title" },
      { key: "audience", label: "Audience" },
      { key: "type", label: "Type" },
      { key: "scheduledAt", label: "Scheduled", kind: "date" },
      { key: "isActive", label: "Active", kind: "boolean" }
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
      { name: "audience", label: "Audience", type: "select", options: ["all", "free", "premium", "inactive"], required: true },
      { name: "type", label: "Type", type: "select", options: ["motivation", "reminder", "update", "promotion"], required: true },
      { name: "scheduledAt", label: "Scheduled At", type: "date" },
      { name: "setup", label: "Setup Complete", type: "boolean" },
      { name: "isActive", label: "Active", type: "boolean" }
    ]
  },
  goals: {
    title: "Goals",
    description: "User goals. To add one for a user, use the account id from the Users page.",
    endpoint: "/goals",
    searchPlaceholder: "Search title or email",
    columns: [
      { key: "userEmail", label: "User" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "targetValue", label: "Target" },
      { key: "currentValue", label: "Current" },
      { key: "unit", label: "Unit" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "userId", label: "User ID", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["height", "weight", "workout", "sleep", "custom"], required: true },
      { name: "targetValue", label: "Target Value", type: "number" },
      { name: "currentValue", label: "Current Value", type: "number" },
      { name: "unit", label: "Unit", type: "text" },
      { name: "startsAt", label: "Starts At", type: "date" },
      { name: "dueAt", label: "Due At", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["active", "completed", "cancelled"], required: true }
    ],
    filters: [{ type: "select", key: "status", label: "Status", options: options(["active", "completed", "cancelled"]) }]
  },
  logs: {
    title: "Daily logs",
    description: "Daily wellness logs. Height entered here is not copied into the measurement trend; users' own logs are.",
    endpoint: "/logs",
    searchPlaceholder: "Search email or notes",
    columns: [
      { key: "userEmail", label: "User" },
      { key: "date", label: "Date" },
      { key: "heightCm", label: "Height" },
      { key: "weightKg", label: "Weight" },
      { key: "sleepHours", label: "Sleep" },
      { key: "workoutMinutes", label: "Workout" },
      { key: "mood", label: "Mood" }
    ],
    fields: [
      { name: "userId", label: "User ID", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "heightCm", label: "Height cm", type: "number" },
      { name: "weightKg", label: "Weight kg", type: "number" },
      { name: "sleepHours", label: "Sleep Hours", type: "number" },
      { name: "waterGlasses", label: "Water Glasses", type: "number" },
      { name: "mood", label: "Mood", type: "select", options: ["great", "good", "okay", "tired", "bad"] },
      { name: "workoutMinutes", label: "Workout Minutes", type: "number" },
      { name: "completedExercises", label: "Completed Exercises (JSON)", type: "textarea" },
      { name: "notes", label: "Notes", type: "textarea" }
    ]
  },
  settings: {
    title: "App settings",
    description: "Key/value settings the app reads (update modal, medical disclaimer, ...).",
    endpoint: "/settings",
    searchPlaceholder: "Search keys",
    columns: [
      { key: "key", label: "Key" },
      { key: "value", label: "Value" },
      { key: "description", label: "Description" },
      { key: "setup", label: "Setup", kind: "boolean" }
    ],
    fields: [
      { name: "key", label: "Key", type: "text", required: true },
      { name: "value", label: "Value (JSON)", type: "textarea", required: true },
      { name: "setup", label: "Setup Complete", type: "boolean" },
      { name: "description", label: "Description", type: "textarea" }
    ]
  }
};
