/**
 * Idempotent seed: admin account, subscription plans, the cross-app recommendation matrix and,
 * outside production, clearly-labelled sample content so the mobile apps have something to show.
 *
 * Sample items are published with expert_reviewed = false and attributes.sample = true; they skip
 * the review workflow on purpose and must never be seeded into production (env.seed.sampleContent).
 */
import bcrypt from "bcryptjs";
import type pg from "pg";
import { APP_CATALOG, type AppCode } from "../config/app-catalog.js";
import { closeDatabase, connectDatabase, getPool } from "../config/database.js";
import { env } from "../config/env.js";
import logger, { EMOJIS } from "../utils/logger.js";
import { runMigrations } from "../utils/migrations.js";

// Illustrative monthly prices from the strategy (section 7); adjust from real conversion data.
const APP_PRO_PRICE_USD = 4.99;
const WELLNESS_PASS_PRICE_USD = 9.99;

// Cross-app recommendation matrix (strategy section 6). Trigger events are emitted by the source app.
const RECOMMENDATION_RULES: Array<{
  code: string;
  sourceApp: AppCode;
  targetApp: AppCode;
  triggerEvent: string;
  headline: string;
  body: string;
}> = [
  { code: "babygrow-to-kids-nutrition", sourceApp: "babygrow", targetApp: "kids-nutrition", triggerEvent: "family_meal_content_viewed", headline: "Age-based meal ideas for your little one", body: "Kids Nutrition plans meals by age with allergy filters." },
  { code: "babygrow-to-healthy-recipes", sourceApp: "babygrow", targetApp: "healthy-recipes", triggerEvent: "family_meal_content_viewed", headline: "Healthy family recipes", body: "Find simple recipes the whole family can share." },
  { code: "foodvisor-to-healthy-recipes", sourceApp: "foodvisor", targetApp: "healthy-recipes", triggerEvent: "diet_meal_intent", headline: "Recipes that fit your goal", body: "Cook meals that match today's nutrition targets." },
  { code: "foodvisor-to-daily-workout", sourceApp: "foodvisor", targetApp: "daily-workout", triggerEvent: "exercise_goal_selected", headline: "Start a 10-minute beginner workout", body: "Pair your meal plan with short guided workouts." },
  { code: "height-increase-to-stretch-posture", sourceApp: "height-increase", targetApp: "stretch-posture", triggerEvent: "posture_content_viewed", headline: "Daily posture and stretching routines", body: "Short guided sessions for posture awareness." },
  { code: "daily-workout-to-daily-yoga", sourceApp: "daily-workout", targetApp: "daily-yoga", triggerEvent: "recovery_intent", headline: "Recover with gentle yoga", body: "10-minute sessions for rest days." },
  { code: "daily-yoga-to-sleep-meditation", sourceApp: "daily-yoga", targetApp: "sleep-meditation", triggerEvent: "evening_session_completed", headline: "Wind down for sleep", body: "Breathing and sleep audio after evening yoga." },
  { code: "healthy-recipes-to-foodvisor", sourceApp: "healthy-recipes", targetApp: "foodvisor", triggerEvent: "recipe_cooked", headline: "Log what you just cooked", body: "Track this meal's nutrition in Foodvisor." },
  { code: "makeup-tutorial-to-skincare-routine", sourceApp: "makeup-tutorial", targetApp: "skincare-routine", triggerEvent: "skin_prep_content_viewed", headline: "Build a skincare routine", body: "Morning and evening routines with reminders." }
];

async function seedAdmin(pool: pg.Pool): Promise<string> {
  const passwordHash = await bcrypt.hash(env.seed.adminPassword, env.bcryptRounds);
  const existing = await pool.query<{ id: string }>("SELECT id FROM identity.users WHERE lower(email) = lower($1)", [env.seed.adminEmail]);
  if (existing.rows[0]) {
    await pool.query("UPDATE identity.users SET role = 'admin' WHERE id = $1", [existing.rows[0].id]);
    return existing.rows[0].id;
  }
  const created = await pool.query<{ id: string }>(
    "INSERT INTO identity.users (email, password_hash, display_name, role) VALUES ($1, $2, 'Wellness Admin', 'admin') RETURNING id",
    [env.seed.adminEmail, passwordHash]
  );
  return created.rows[0].id;
}

async function upsertPlan(
  pool: pg.Pool,
  plan: { code: string; name: string; tier: "app_pro" | "wellness_pass"; appCode: AppCode | null; priceUsd: number },
  apps: AppCode[]
): Promise<void> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO billing.plans (code, name, tier, app_code, billing_period, price_usd)
     VALUES ($1, $2, $3, $4, 'monthly', $5)
     ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, price_usd = EXCLUDED.price_usd, updated_at = now()
     RETURNING id`,
    [plan.code, plan.name, plan.tier, plan.appCode, plan.priceUsd]
  );
  const planId = result.rows[0].id;
  for (const appCode of apps) {
    await pool.query("INSERT INTO billing.plan_apps (plan_id, app_code) VALUES ($1, $2) ON CONFLICT DO NOTHING", [planId, appCode]);
  }
  // Only dev-store SKUs are seeded; real App Store / Play product ids are added once they exist in the consoles.
  await pool.query(
    "INSERT INTO billing.plan_store_products (plan_id, store, product_id) VALUES ($1, 'dev', $2) ON CONFLICT DO NOTHING",
    [planId, `dev.${plan.code}`]
  );
}

async function seedPlans(pool: pg.Pool): Promise<number> {
  const moduleApps = APP_CATALOG.filter((app) => app.backendModule);
  for (const app of moduleApps) {
    await upsertPlan(pool, { code: `${app.code}_pro_monthly`, name: `${app.name} Pro`, tier: "app_pro", appCode: app.code, priceUsd: APP_PRO_PRICE_USD }, [app.code]);
  }
  const passApps = APP_CATALOG.filter((app) => app.wellnessPassEligible).map((app) => app.code);
  await upsertPlan(pool, { code: "wellness_pass_monthly", name: "Wellness Pass", tier: "wellness_pass", appCode: null, priceUsd: WELLNESS_PASS_PRICE_USD }, passApps);
  return moduleApps.length + 1;
}

async function seedRecommendationRules(pool: pg.Pool): Promise<number> {
  for (const [index, rule] of RECOMMENDATION_RULES.entries()) {
    await pool.query(
      `INSERT INTO reco.rules (code, source_app, target_app, trigger_event, headline, body, deep_link, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (code) DO NOTHING`,
      [rule.code, rule.sourceApp, rule.targetApp, rule.triggerEvent, rule.headline, rule.body, `wellness://${rule.targetApp}`, (index + 1) * 10]
    );
  }
  return RECOMMENDATION_RULES.length;
}

async function seedSampleContent(pool: pg.Pool, adminId: string): Promise<void> {
  const recipes = [
    {
      title: "[Sample] Greek yogurt berry bowl",
      category: "breakfast",
      tags: ["high-protein", "vegetarian"],
      minutes: 5,
      attributes: {
        sample: true,
        servings: 1,
        ingredients: [
          { name: "Greek yogurt", quantity: 200, unit: "g" },
          { name: "Mixed berries", quantity: 80, unit: "g" },
          { name: "Honey", quantity: 1, unit: "tsp" }
        ],
        nutritionPerServing: { calories: 230, proteinG: 20, carbsG: 25, fatG: 5 },
        nutritionSource: "placeholder - replace with USDA FoodData Central values",
        allergens: ["milk"]
      }
    },
    {
      title: "[Sample] Chicken quinoa salad",
      category: "lunch",
      tags: ["high-protein", "gluten-free"],
      minutes: 20,
      attributes: {
        sample: true,
        servings: 2,
        ingredients: [
          { name: "Chicken breast", quantity: 250, unit: "g" },
          { name: "Quinoa", quantity: 120, unit: "g" },
          { name: "Cucumber", quantity: 1 },
          { name: "Olive oil", quantity: 1, unit: "tbsp" },
          { name: "Salt" }
        ],
        nutritionPerServing: { calories: 480, proteinG: 38, carbsG: 45, fatG: 14 },
        nutritionSource: "placeholder - replace with USDA FoodData Central values",
        allergens: []
      }
    }
  ];

  for (const recipe of recipes) {
    const exists = await pool.query("SELECT 1 FROM content.items WHERE title = $1", [recipe.title]);
    if (exists.rowCount) continue;
    await pool.query(
      `INSERT INTO content.items
         (content_type, title, summary, app_codes, category, tags, duration_minutes, difficulty, steps, attributes,
          review_status, expert_reviewed, published_at, created_by)
       VALUES ('recipe', $1, 'Sample recipe for development', ARRAY['healthy-recipes', 'foodvisor'], $2, $3, $4, 'beginner',
               $5, $6, 'published', false, now(), $7)`,
      [
        recipe.title,
        recipe.category,
        recipe.tags,
        recipe.minutes,
        JSON.stringify([{ text: "Combine the ingredients." }, { text: "Serve." }]),
        JSON.stringify(recipe.attributes),
        adminId
      ]
    );
  }

  const exercises = [
    { name: "[Sample] Bodyweight squat", apps: ["daily-workout"], areas: ["legs"], seconds: 40, reps: 12 },
    { name: "[Sample] Forearm plank", apps: ["daily-workout", "height-increase"], areas: ["core"], seconds: 30, reps: null },
    { name: "[Sample] Cat-cow", apps: ["daily-yoga", "height-increase"], areas: ["spine"], seconds: 60, reps: null },
    { name: "[Sample] Child's pose", apps: ["daily-yoga"], areas: ["back", "hips"], seconds: 60, reps: null },
    { name: "[Sample] Wall angel", apps: ["height-increase"], areas: ["shoulders", "upper-back"], seconds: 45, reps: 10 }
  ];
  const exerciseIds = new Map<string, string>();
  for (const exercise of exercises) {
    const existing = await pool.query<{ id: string }>("SELECT id FROM routine.exercises WHERE name = $1", [exercise.name]);
    if (existing.rows[0]) {
      exerciseIds.set(exercise.name, existing.rows[0].id);
      continue;
    }
    const created = await pool.query<{ id: string }>(
      `INSERT INTO routine.exercises
         (name, app_codes, body_areas, default_duration_seconds, default_reps, safety_notes, status, expert_reviewed, created_by)
       VALUES ($1, $2, $3, $4, $5, ARRAY['Sample data: replace with expert-reviewed guidance', 'Stop if you feel pain'], 'published', false, $6)
       RETURNING id`,
      [exercise.name, exercise.apps, exercise.areas, exercise.seconds, exercise.reps, adminId]
    );
    exerciseIds.set(exercise.name, created.rows[0].id);
  }

  const routines: Array<{ appCode: AppCode; title: string; goal: string; minutes: number; steps: string[] }> = [
    { appCode: "daily-workout", title: "[Sample] 10-minute beginner full body", goal: "general-fitness", minutes: 10, steps: ["[Sample] Bodyweight squat", "[Sample] Forearm plank"] },
    { appCode: "daily-yoga", title: "[Sample] Morning stretch", goal: "flexibility", minutes: 10, steps: ["[Sample] Cat-cow", "[Sample] Child's pose"] },
    { appCode: "height-increase", title: "[Sample] Posture basics", goal: "posture", minutes: 8, steps: ["[Sample] Wall angel", "[Sample] Cat-cow", "[Sample] Forearm plank"] }
  ];
  for (const routine of routines) {
    const exists = await pool.query("SELECT 1 FROM routine.routines WHERE title = $1 AND app_code = $2", [routine.title, routine.appCode]);
    if (exists.rowCount) continue;
    const created = await pool.query<{ id: string }>(
      `INSERT INTO routine.routines (app_code, title, goal, level, estimated_minutes, status, expert_reviewed, created_by)
       VALUES ($1, $2, $3, 'beginner', $4, 'published', false, $5) RETURNING id`,
      [routine.appCode, routine.title, routine.goal, routine.minutes, adminId]
    );
    for (const [position, name] of routine.steps.entries()) {
      await pool.query(
        "INSERT INTO routine.routine_steps (routine_id, position, exercise_id, duration_seconds, rest_seconds) VALUES ($1, $2, $3, 45, 15)",
        [created.rows[0].id, position, exerciseIds.get(name)]
      );
    }
  }
}

async function main(): Promise<void> {
  await connectDatabase();
  const pool = getPool();
  await runMigrations(pool);

  const adminId = await seedAdmin(pool);
  const plans = await seedPlans(pool);
  const rules = await seedRecommendationRules(pool);
  if (env.seed.sampleContent) await seedSampleContent(pool, adminId);

  logger.successWithEmoji(EMOJIS.SEED, "Seed complete", "SEED", {
    admin: env.seed.adminEmail,
    plans,
    recommendationRules: rules,
    sampleContent: env.seed.sampleContent
  });
}

main()
  .catch((error: unknown) => {
    logger.errorWithEmoji(EMOJIS.ERROR, "Seed failed", "SEED", { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
