/**
 * Single source of truth for every app in the Wellness Ecosystem portfolio
 * (see docs/Wellness_Ecosystem_2027_English.md). It is synced into `identity.apps`
 * on migrate so other tables can reference app codes with foreign keys.
 *
 * `backendModule: true` means the app has its own module under src/modules/apps.
 * Every other app can already use the shared platform (accounts, analytics,
 * content, subscriptions, reminders) and gets its own module once it is built.
 */
export type AppCategory = "family-growth" | "food-nutrition" | "fitness-mind" | "beauty-self-care" | "health-care";

// Drives what may cross app boundaries: child and health data never leave their app without explicit consent.
export type DataSensitivity = "child" | "health" | "standard";

export type AppLifecycle =
  | "existing"
  | "build-first"
  | "build-next"
  | "market-test"
  | "conditional"
  | "content-first"
  | "feature-first"
  | "long-term"
  | "planned";

export interface AppDefinition {
  code: string;
  name: string;
  category: AppCategory;
  dataSensitivity: DataSensitivity;
  lifecycle: AppLifecycle;
  backendModule: boolean;
  wellnessPassEligible: boolean;
}

export const APP_CATALOG = [
  { code: "babygrow", name: "BabyGrow", category: "family-growth", dataSensitivity: "child", lifecycle: "existing", backendModule: true, wellnessPassEligible: true },
  { code: "height-increase", name: "HeightIncrease", category: "family-growth", dataSensitivity: "health", lifecycle: "existing", backendModule: true, wellnessPassEligible: true },
  { code: "kids-nutrition", name: "Kids Nutrition", category: "family-growth", dataSensitivity: "child", lifecycle: "conditional", backendModule: false, wellnessPassEligible: true },
  { code: "pregnancy-tracker", name: "Pregnancy Tracker", category: "family-growth", dataSensitivity: "health", lifecycle: "long-term", backendModule: false, wellnessPassEligible: true },

  { code: "foodvisor", name: "Foodvisor", category: "food-nutrition", dataSensitivity: "health", lifecycle: "existing", backendModule: true, wellnessPassEligible: true },
  { code: "healthy-recipes", name: "Healthy Recipes", category: "food-nutrition", dataSensitivity: "standard", lifecycle: "build-first", backendModule: true, wellnessPassEligible: true },
  { code: "meal-planner", name: "Meal Planner", category: "food-nutrition", dataSensitivity: "standard", lifecycle: "feature-first", backendModule: false, wellnessPassEligible: true },
  { code: "cookies-baking", name: "Cookies & Baking", category: "food-nutrition", dataSensitivity: "standard", lifecycle: "content-first", backendModule: false, wellnessPassEligible: true },
  { code: "world-cuisines", name: "World Cuisines", category: "food-nutrition", dataSensitivity: "standard", lifecycle: "planned", backendModule: false, wellnessPassEligible: true },

  { code: "daily-workout", name: "Daily Workout", category: "fitness-mind", dataSensitivity: "health", lifecycle: "build-first", backendModule: true, wellnessPassEligible: true },
  { code: "daily-yoga", name: "Daily Yoga", category: "fitness-mind", dataSensitivity: "health", lifecycle: "build-next", backendModule: true, wellnessPassEligible: true },
  { code: "stretch-posture", name: "Stretch & Posture", category: "fitness-mind", dataSensitivity: "health", lifecycle: "planned", backendModule: false, wellnessPassEligible: true },
  { code: "sleep-meditation", name: "Sleep & Meditation", category: "fitness-mind", dataSensitivity: "health", lifecycle: "build-next", backendModule: false, wellnessPassEligible: true },

  { code: "makeup-tutorial", name: "Makeup Tutorial", category: "beauty-self-care", dataSensitivity: "standard", lifecycle: "market-test", backendModule: false, wellnessPassEligible: true },
  { code: "skincare-routine", name: "Skincare Routine", category: "beauty-self-care", dataSensitivity: "health", lifecycle: "market-test", backendModule: false, wellnessPassEligible: true },
  { code: "face-yoga", name: "Face Yoga", category: "beauty-self-care", dataSensitivity: "standard", lifecycle: "planned", backendModule: false, wellnessPassEligible: true },
  { code: "haircare-guide", name: "Haircare Guide", category: "beauty-self-care", dataSensitivity: "standard", lifecycle: "planned", backendModule: false, wellnessPassEligible: true },

  { code: "medicine-store", name: "Medicine Store", category: "health-care", dataSensitivity: "health", lifecycle: "existing", backendModule: false, wellnessPassEligible: false },
  { code: "womens-health", name: "Women's Health", category: "health-care", dataSensitivity: "health", lifecycle: "planned", backendModule: false, wellnessPassEligible: true },
  { code: "health-track-ai", name: "Health Track AI", category: "health-care", dataSensitivity: "health", lifecycle: "planned", backendModule: false, wellnessPassEligible: true },
  { code: "smartwatch-sync", name: "Smartwatch Sync", category: "health-care", dataSensitivity: "health", lifecycle: "planned", backendModule: false, wellnessPassEligible: false }
] as const satisfies readonly AppDefinition[];

export type AppCode = (typeof APP_CATALOG)[number]["code"];

export const APP_CODES: readonly AppCode[] = APP_CATALOG.map((app) => app.code);

export function isAppCode(value: unknown): value is AppCode {
  return typeof value === "string" && (APP_CODES as readonly string[]).includes(value);
}

export function getAppDefinition(code: AppCode): AppDefinition {
  return APP_CATALOG.find((app) => app.code === code) as AppDefinition;
}
