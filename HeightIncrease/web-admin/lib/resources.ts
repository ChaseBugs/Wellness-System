export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "url"
  | "textarea"
  | "json"
  | "checkbox"
  | "datetime-local"
  | `select:${string}`;

export type ResourceField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  wide?: boolean;
  help?: string;
};

export type ResourceConfig = {
  title: string;
  endpoint: string;
  columns: string[];
  fields: ResourceField[];
};

const commonFlags: ResourceField[] = [
  { key: "doctor_verified", label: "Doctor Verified", type: "checkbox" },
  { key: "setup", label: "Setup Complete", type: "checkbox" }
];

export const resources: Record<string, ResourceConfig> = {
  users: {
    title: "Users",
    endpoint: "users",
    columns: ["name", "email", "role", "status", "streakDays", "points", "createdAt"],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "password", label: "Password", type: "password" },
      { key: "role", label: "Role", type: "select:user,admin", required: true },
      { key: "status", label: "Status", type: "select:active,blocked", required: true },
      { key: "streakDays", label: "Streak Days", type: "number" },
      { key: "points", label: "Points", type: "number" },
      { key: "measurements", label: "Measurements", type: "json", wide: true }
    ]
  },
  exercises: {
    title: "Exercises",
    endpoint: "exercises",
    columns: ["title", "category", "durationSeconds", "difficulty", "doctor_verified", "setup", "isActive"],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text" },
      { key: "category", label: "Category", type: "select:stretching,posture,strength,cardio,yoga,warmup,custom", required: true },
      { key: "durationSeconds", label: "Duration Seconds", type: "number", required: true },
      { key: "calories", label: "Calories", type: "number" },
      { key: "difficulty", label: "Difficulty", type: "select:beginner,intermediate,advanced", required: true },
      { key: "ageGroup", label: "Age Group", type: "text" },
      { key: "imageUrl", label: "Image URL", type: "url" },
      { key: "videoUrl", label: "Video URL", type: "url" },
      { key: "equipment", label: "Equipment", type: "json", wide: true },
      { key: "targetAreas", label: "Target Areas", type: "json", wide: true },
      { key: "steps", label: "Steps", type: "json", wide: true },
      { key: "tips", label: "Tips", type: "json", wide: true },
      ...commonFlags,
      { key: "sortOrder", label: "Sort Order", type: "number" },
      { key: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  "training-plans": {
    title: "Training Plans",
    endpoint: "training-plans",
    columns: ["title", "level", "type", "estimatedMinutes", "doctor_verified", "setup", "isPremium", "isActive"],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "level", label: "Level", type: "select:beginner,intermediate,advanced", required: true },
      { key: "type", label: "Type", type: "select:featured,daily,weekly,custom-template", required: true },
      { key: "bannerImageUrl", label: "Banner Image URL", type: "url" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "estimatedMinutes", label: "Estimated Minutes", type: "number" },
      { key: "goal", label: "Goal", type: "text", wide: true },
      {
        key: "exercises",
        label: "Exercises JSON",
        type: "json",
        wide: true,
        help: "Use exercise ObjectIds: [{\"exercise\":\"...\",\"order\":1,\"durationSeconds\":20,\"sets\":1,\"restSeconds\":10}]"
      },
      { key: "tags", label: "Tags", type: "json", wide: true },
      ...commonFlags,
      { key: "isPremium", label: "Premium", type: "checkbox" },
      { key: "isActive", label: "Active", type: "checkbox" },
      { key: "sortOrder", label: "Sort Order", type: "number" }
    ]
  },
  articles: {
    title: "Articles",
    endpoint: "articles",
    columns: ["title", "category", "readMinutes", "doctor_verified", "setup", "isFeatured", "isPublished"],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text" },
      { key: "category", label: "Category", type: "select:nutrition,sleep,height-tips,reports,fashion,motivation,general", required: true },
      { key: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { key: "body", label: "Body", type: "textarea", required: true, wide: true },
      { key: "imageUrl", label: "Image URL", type: "url" },
      { key: "authorName", label: "Author", type: "text" },
      { key: "readMinutes", label: "Read Minutes", type: "number" },
      { key: "tags", label: "Tags", type: "json", wide: true },
      ...commonFlags,
      { key: "isFeatured", label: "Featured", type: "checkbox" },
      { key: "isPublished", label: "Published", type: "checkbox" }
    ]
  },
  banners: {
    title: "Banners",
    endpoint: "banners",
    columns: ["title", "placement", "priority", "setup", "isActive"],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "textarea", wide: true },
      { key: "placement", label: "Placement", type: "select:home-top,home-card,reports-top,modal,discover", required: true },
      { key: "imageUrl", label: "Image URL", type: "url" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      { key: "ctaUrl", label: "CTA URL", type: "text" },
      { key: "backgroundColor", label: "Background Color", type: "text" },
      { key: "startsAt", label: "Starts At", type: "datetime-local" },
      { key: "endsAt", label: "Ends At", type: "datetime-local" },
      { key: "setup", label: "Setup Complete", type: "checkbox" },
      { key: "priority", label: "Priority", type: "number" },
      { key: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  notifications: {
    title: "Notifications",
    endpoint: "notifications",
    columns: ["title", "audience", "type", "setup", "isActive", "scheduledAt"],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "message", label: "Message", type: "textarea", required: true, wide: true },
      { key: "audience", label: "Audience", type: "select:all,free,premium,inactive", required: true },
      { key: "type", label: "Type", type: "select:motivation,reminder,update,promotion", required: true },
      { key: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
      { key: "setup", label: "Setup Complete", type: "checkbox" },
      { key: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  goals: {
    title: "Goals",
    endpoint: "goals",
    columns: ["title", "type", "targetValue", "currentValue", "unit", "status"],
    fields: [
      { key: "user", label: "User ObjectId", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "type", label: "Type", type: "select:height,weight,workout,sleep,custom", required: true },
      { key: "targetValue", label: "Target Value", type: "number" },
      { key: "currentValue", label: "Current Value", type: "number" },
      { key: "unit", label: "Unit", type: "text" },
      { key: "startsAt", label: "Starts At", type: "datetime-local" },
      { key: "dueAt", label: "Due At", type: "datetime-local" },
      { key: "status", label: "Status", type: "select:active,completed,cancelled", required: true }
    ]
  },
  logs: {
    title: "Daily Logs",
    endpoint: "logs",
    columns: ["user", "date", "heightCm", "weightKg", "sleepHours", "workoutMinutes"],
    fields: [
      { key: "user", label: "User ObjectId", type: "text", required: true },
      { key: "date", label: "Date", type: "datetime-local", required: true },
      { key: "heightCm", label: "Height CM", type: "number" },
      { key: "weightKg", label: "Weight KG", type: "number" },
      { key: "sleepHours", label: "Sleep Hours", type: "number" },
      { key: "waterGlasses", label: "Water Glasses", type: "number" },
      { key: "mood", label: "Mood", type: "select:great,good,okay,tired,bad" },
      { key: "workoutMinutes", label: "Workout Minutes", type: "number" },
      { key: "completedExercises", label: "Completed Exercises", type: "json", wide: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true }
    ]
  },
  settings: {
    title: "Settings",
    endpoint: "settings",
    columns: ["key", "value", "setup", "description"],
    fields: [
      { key: "key", label: "Key", type: "text", required: true },
      { key: "value", label: "Value", type: "json", required: true, wide: true },
      { key: "setup", label: "Setup Complete", type: "checkbox" },
      { key: "description", label: "Description", type: "textarea", wide: true }
    ]
  }
};

export const navItems = [
  ["dashboard", "Dashboard"],
  ["users", "Users"],
  ["exercises", "Exercises"],
  ["training-plans", "Plans"],
  ["articles", "Articles"],
  ["banners", "Banners"],
  ["notifications", "Push"],
  ["goals", "Goals"],
  ["logs", "Reports"],
  ["settings", "Settings"]
] as const;
