/* eslint-disable @typescript-eslint/no-explicit-any -- assertions walk arbitrary JSON response bodies */
/**
 * End-to-end smoke test against a running server (`npm run dev` + `npm run seed` first).
 * Exercises every module through the public HTTP API, including the cross-app rules
 * (entitlements, consent-gated data, recommendations, caregiver access).
 *
 *   SMOKE_BASE_URL=http://localhost:4500/api/v1 npm run smoke
 */
import { env } from "../config/env.js";

const BASE = process.env.SMOKE_BASE_URL || `http://localhost:${env.port}${env.apiPrefix}`;
const RUN = Date.now().toString(36);
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

interface ApiResult {
  status: number;
  body: { success: boolean; data?: any; error?: { code: string; message: string } } | null;
}

async function api(method: string, path: string, options: { token?: string; app?: string; body?: unknown } = {}): Promise<ApiResult> {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(options.app ? { "x-app-code": options.app } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

let passed = 0;
const failures: string[] = [];

function check(condition: unknown, message: string, detail?: unknown): void {
  if (!condition) throw new Error(`${message}${detail === undefined ? "" : ` -> ${JSON.stringify(detail).slice(0, 400)}`}`);
}

function expectStatus(result: ApiResult, status: number, label: string): any {
  check(result.status === status, `${label}: expected HTTP ${status}, got ${result.status}`, result.body);
  return result.body?.data;
}

async function step(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    passed++;
    process.stdout.write(`  ok   ${name}\n`);
  } catch (error) {
    failures.push(name);
    process.stdout.write(`  FAIL ${name}\n       ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

async function register(email: string, app: string): Promise<{ token: string; refresh: string; id: string }> {
  const data = expectStatus(await api("POST", "/auth/register", { app, body: { email, password: "Password123!", displayName: email.split("@")[0] } }), 201, `register ${email}`);
  return { token: data.tokens.accessToken, refresh: data.tokens.refreshToken, id: data.user.id };
}

async function main(): Promise<void> {
  process.stdout.write(`Smoke test against ${BASE}\n`);
  const ctx: Record<string, any> = {};

  await step("health reports database ok and all modules", async () => {
    const data = expectStatus(await api("GET", "/health"), 200, "health");
    check(data.database === "ok" && data.modules.length === 15, "unexpected health payload", data);
  });

  await step("identity: register, catalog install flag, validation and 404 envelopes", async () => {
    ctx.a = await register(`smoke-a-${RUN}@test.dev`, "foodvisor");
    ctx.b = await register(`smoke-b-${RUN}@test.dev`, "babygrow");
    const catalog = expectStatus(await api("GET", "/catalog/apps", { token: ctx.a.token }), 200, "catalog");
    check(catalog.find((app: any) => app.code === "foodvisor")?.installed === true, "foodvisor should be installed for A");
    check(catalog.length === 21, "catalog should list 21 apps", catalog.length);
    expectStatus(await api("POST", "/auth/register", { body: { email: `smoke-a-${RUN}@test.dev`, password: "Password123!" } }), 409, "duplicate email");
    const notFound = await api("GET", "/nope");
    check(notFound.status === 404 && notFound.body?.error?.code === "NOT_FOUND", "404 envelope", notFound.body);
    expectStatus(await api("GET", "/content/not-a-uuid"), 400, "invalid uuid");
  });

  await step("identity: refresh rotation and reuse detection", async () => {
    const c = await register(`smoke-c-${RUN}@test.dev`, "daily-yoga");
    const rotated = expectStatus(await api("POST", "/auth/refresh", { body: { refreshToken: c.refresh } }), 200, "refresh");
    check(rotated.refreshToken !== c.refresh, "refresh token should rotate");
    expectStatus(await api("POST", "/auth/refresh", { body: { refreshToken: c.refresh } }), 401, "reused refresh token");
    expectStatus(await api("POST", "/auth/refresh", { body: { refreshToken: rotated.refreshToken } }), 401, "family revoked after reuse");
  });

  await step("identity: admin login (seeded)", async () => {
    const data = expectStatus(await api("POST", "/auth/login", { body: { email: env.seed.adminEmail, password: env.seed.adminPassword } }), 200, "admin login");
    ctx.admin = data.tokens.accessToken;
    expectStatus(await api("GET", "/content/manage/items", { token: ctx.a.token }), 403, "non-editor blocked");
  });

  await step("content: draft -> submit -> expert review -> publish workflow", async () => {
    const draft = expectStatus(
      await api("POST", "/content/manage/items", {
        token: ctx.admin,
        body: {
          contentType: "recipe",
          title: `Smoke lentil soup ${RUN}`,
          appCodes: ["healthy-recipes", "foodvisor"],
          category: "dinner",
          tags: ["vegan"],
          durationMinutes: 30,
          steps: [{ text: "Simmer everything." }],
          attributes: {
            servings: 2,
            ingredients: [{ name: "Red lentils", quantity: 200, unit: "g" }, { name: "Carrot", quantity: 2 }, { name: "Salt" }],
            nutritionPerServing: { calories: 350, proteinG: 18, carbsG: 50, fatG: 6 },
            allergens: []
          }
        }
      }),
      201,
      "create recipe"
    );
    check(draft.reviewStatus === "draft" && draft.expertReviewed === false, "new content must be an unreviewed draft", draft);
    expectStatus(await api("POST", `/content/manage/items/${draft.id}/publish`, { token: ctx.admin }), 409, "publish before review");
    expectStatus(await api("POST", `/content/manage/items/${draft.id}/submit`, { token: ctx.admin }), 200, "submit");
    expectStatus(await api("POST", `/content/manage/items/${draft.id}/review`, { token: ctx.admin, body: { approve: true } }), 200, "review");
    const published = expectStatus(await api("POST", `/content/manage/items/${draft.id}/publish`, { token: ctx.admin }), 200, "publish");
    check(published.reviewStatus === "published", "should be published", published);
    ctx.recipeId = draft.id;

    const incomplete = expectStatus(
      await api("POST", "/content/manage/items", { token: ctx.admin, body: { contentType: "recipe", title: "Incomplete", appCodes: ["healthy-recipes"] } }),
      201,
      "create incomplete"
    );
    expectStatus(await api("POST", `/content/manage/items/${incomplete.id}/submit`, { token: ctx.admin }), 400, "submit recipe without ingredients");
  });

  await step("content: premium item is locked without an entitlement", async () => {
    const premium = expectStatus(
      await api("POST", "/content/manage/items", {
        token: ctx.admin,
        body: {
          contentType: "recipe",
          title: `Smoke premium bowl ${RUN}`,
          appCodes: ["healthy-recipes"],
          isPremium: true,
          steps: [{ text: "Secret step" }],
          attributes: { servings: 1, ingredients: [{ name: "Rice", quantity: 100, unit: "g" }] }
        }
      }),
      201,
      "create premium"
    );
    for (const action of ["submit", "review", "publish"]) {
      expectStatus(await api("POST", `/content/manage/items/${premium.id}/${action}`, { token: ctx.admin, body: { approve: true } }), 200, action);
    }
    ctx.premiumId = premium.id;
    const locked = expectStatus(await api("GET", `/content/${premium.id}`, { token: ctx.a.token }), 200, "get premium");
    check(locked.locked === true && locked.steps.length === 0, "premium content should be locked", locked);
  });

  await step("subscriptions: Wellness Pass purchase unlocks apps, duplicates and receipt sharing blocked", async () => {
    const plans = expectStatus(await api("GET", "/subscriptions/plans?app=healthy-recipes"), 200, "plans");
    check(plans.some((plan: any) => plan.code === "wellness_pass_monthly"), "wellness pass should unlock healthy-recipes", plans);
    const before = expectStatus(await api("GET", "/subscriptions/eligibility?planCode=wellness_pass_monthly", { token: ctx.a.token }), 200, "eligibility");
    check(before.eligible === true, "should be eligible", before);

    ctx.passToken = `smoke-pass-${RUN}`;
    const verified = expectStatus(
      await api("POST", "/subscriptions/purchases/verify", {
        token: ctx.a.token,
        app: "healthy-recipes",
        body: { store: "dev", productId: "dev.wellness_pass_monthly", purchaseToken: ctx.passToken }
      }),
      201,
      "verify purchase"
    );
    check(verified.entitlements.tier === "wellness_pass" && verified.duplicate === false, "should grant wellness pass", verified);

    const unlocked = expectStatus(await api("GET", `/content/${ctx.premiumId}`, { token: ctx.a.token }), 200, "premium after purchase");
    check(unlocked.locked === false && unlocked.steps.length === 1, "premium should unlock", unlocked);

    const after = expectStatus(await api("GET", "/subscriptions/eligibility?planCode=foodvisor_pro_monthly", { token: ctx.a.token }), 200, "eligibility after");
    check(after.eligible === false && after.reason === "ALREADY_ENTITLED", "App Pro should be redundant under Wellness Pass", after);

    const stolen = await api("POST", "/subscriptions/purchases/verify", {
      token: ctx.b.token,
      body: { store: "dev", productId: "dev.wellness_pass_monthly", purchaseToken: ctx.passToken }
    });
    check(stolen.status === 409 && stolen.body?.error?.code === "PURCHASE_OWNED_BY_OTHER_ACCOUNT", "receipt sharing must be rejected", stolen.body);

    expectStatus(await api("POST", "/subscriptions/purchases/verify", { token: ctx.a.token, body: { store: "apple", productId: "x", purchaseToken: "y" } }), 404, "unknown apple product");
  });

  await step("healthy-recipes: browse, save, seven-day plan and scaled shopping list", async () => {
    const recipes = expectStatus(await api("GET", "/apps/healthy-recipes/recipes?tag=vegan", { token: ctx.a.token }), 200, "list recipes");
    check(recipes.items.some((recipe: any) => recipe.id === ctx.recipeId), "published recipe should be listed", recipes);
    expectStatus(await api("PUT", `/apps/healthy-recipes/saved-recipes/${ctx.recipeId}`, { token: ctx.a.token }), 204, "save");
    const saved = expectStatus(await api("GET", "/apps/healthy-recipes/saved-recipes", { token: ctx.a.token }), 200, "saved list");
    check(saved.length === 1, "one saved recipe", saved);

    const plan = expectStatus(
      await api("POST", "/apps/healthy-recipes/meal-plans", {
        token: ctx.a.token,
        body: {
          title: "Smoke week",
          startDate: today,
          items: [
            { dayIndex: 0, mealType: "dinner", contentId: ctx.recipeId, servings: 2 },
            { dayIndex: 3, mealType: "lunch", contentId: ctx.recipeId, servings: 4 }
          ]
        }
      }),
      201,
      "create meal plan"
    );
    check(plan.days.length === 7 && plan.days[3].meals[0].title?.startsWith("Smoke lentil soup"), "plan days", plan);
    const list = expectStatus(await api("GET", `/apps/healthy-recipes/meal-plans/${plan.id}/shopping-list`, { token: ctx.a.token }), 200, "shopping list");
    const lentils = list.items.find((item: any) => item.name === "Red lentils");
    const salt = list.items.find((item: any) => item.name === "Salt");
    check(lentils?.quantity === 600 && lentils.unit === "g" && salt?.quantity === null, "6 servings of a 2-serving recipe -> 600 g lentils", list);
  });

  await step("foodvisor: food search, meal logging (food, manual, recipe) and daily summary", async () => {
    const food = expectStatus(
      await api("POST", "/apps/foodvisor/admin/foods", {
        token: ctx.admin,
        body: {
          koreanName: `Smoke oats ${RUN}`,
          category: "grains",
          servingSize: "100 g",
          calories: 380,
          macros: { protein: 13, carbs: 67, fat: 7, fiber: 10 },
          minerals: { iron: 4.7, magnesium: 138 },
          dataSource: "usda_fdc",
          doctorVerified: true
        }
      }),
      201,
      "create food"
    );
    check(food.doctorVerified === false, "admin-created foods are forced unverified", food);
    ctx.oatsId = food.id;
    const found = expectStatus(await api("GET", `/apps/foodvisor/foods?q=${encodeURIComponent(`Smoke oats ${RUN}`)}`, { token: ctx.a.token }), 200, "search");
    check(found.items.length >= 1, "food search", found);

    const meal = expectStatus(
      await api("POST", "/apps/foodvisor/meal-logs", {
        token: ctx.a.token,
        body: { eatenAt: new Date().toISOString(), mealType: "breakfast", items: [{ foodId: food.id, quantityG: 50 }, { name: "Coffee", calories: 5 }] }
      }),
      201,
      "log meal"
    );
    check(meal.totals.calories === 195 && meal.totals.proteinG === 6.5, "50 g oats (190 kcal) + coffee (5 kcal)", meal.totals);

    const fromRecipe = expectStatus(
      await api("POST", "/apps/foodvisor/meal-logs", {
        token: ctx.a.token,
        body: { eatenAt: new Date().toISOString(), mealType: "dinner", recipe: { contentId: ctx.recipeId, servings: 1.5 } }
      }),
      201,
      "log recipe"
    );
    check(fromRecipe.source === "recipe" && fromRecipe.totals.calories === 525, "1.5 servings x 350 kcal", fromRecipe);

    expectStatus(await api("PUT", "/apps/foodvisor/nutrition-goal", { token: ctx.a.token, body: { goalType: "maintain", calories: 2000 } }), 200, "goal");
    const summary = expectStatus(await api("GET", `/apps/foodvisor/daily-summary?date=${today}`, { token: ctx.a.token }), 200, "summary");
    check(summary.mealsLogged === 2 && summary.totals.calories === 720 && summary.remainingCalories === 1280, "daily totals", summary);
    check(summary.connectedActivity.length === 0, "no activity without consent", summary);
  });

  await step("foodvisor legacy: public calculators (no account), WS/T 578 targets from imported rules", async () => {
    const targets = expectStatus(
      await api("POST", "/apps/foodvisor/daily-targets/resolve", { body: { age: 30, gender: "male", pal: "light" } }),
      200,
      "resolve targets"
    );
    check(targets.count > 10 && typeof targets.goals.protein === "number" && targets.profile.populationGroup === "adult", "targets from imported WS/T 578 rules", {
      count: targets.count,
      profile: targets.profile
    });
    const pregnancy = expectStatus(await api("GET", "/apps/foodvisor/daily-targets?age=29&gender=male&lifeStage=pregnancy_mid"), 200, "pregnancy targets");
    check(pregnancy.profile.gender === "female" && pregnancy.warnings.some((w: any) => w.code === "life_stage_gender_adjusted"), "life stage normalization", pregnancy.warnings);

    const metrics = expectStatus(
      await api("POST", "/apps/foodvisor/health-metrics/calculate", {
        body: { gender: "female", age: 34, heightCm: 165, weightKg: 60, activityLevel: "active", goal: "lose_weight", activities: [{ name: "walk", metValue: 3.5, durationMinutes: 30 }] }
      }),
      200,
      "health metrics"
    );
    check(metrics.bmi.value === 22 && metrics.activityBurn.totalCalories === 105 && metrics.calorieGoal.goalAdjustmentCalories === -500, "BMI 22.0, MET burn 105 kcal", metrics.bmi);
    expectStatus(await api("POST", "/apps/foodvisor/health-metrics/calculate", { body: { gender: "x", age: 0 } }), 400, "invalid metrics input");

    const questions = expectStatus(await api("GET", "/apps/foodvisor/human-type/questions"), 200, "questions");
    check(questions.length === 42 && questions[0].options.every((option: any) => !("score" in option)), "42 questions without scores", questions[0]);
    ctx.questions = questions;
  });

  await step("foodvisor admin: legacy CRUD contract, review flag, bulk actions, dashboard, audit", async () => {
    // Search for this run's food only: earlier runs leave "Smoke oats" rows with equal calories behind.
    const list = expectStatus(
      await api("GET", `/apps/foodvisor/admin/foods?q=${encodeURIComponent(`oats ${RUN}`)}&sort=-calories&limit=5&calories_gte=100`, { token: ctx.admin }),
      200,
      "admin list"
    );
    check(list.items.some((item: any) => item.id === ctx.oatsId) && list.limit === 5 && typeof list.total === "number", "search + range filter + sort", list.total);
    const byCategory = expectStatus(await api("GET", "/apps/foodvisor/admin/nutrient-intake-rules?gender=male,female&limit=1", { token: ctx.admin }), 200, "comma filter");
    check(byCategory.total > 100, "comma-list filter over imported rules", byCategory.total);
    expectStatus(await api("GET", "/apps/foodvisor/admin/foods", { token: ctx.a.token }), 403, "non-editor blocked");

    const updated = expectStatus(await api("PUT", `/apps/foodvisor/admin/foods/${ctx.oatsId}`, { token: ctx.admin, body: { doctorVerified: true, tags: "whole-grain, breakfast" } }), 200, "admin verify");
    check(updated.doctorVerified === true && updated.tags.length === 2, "admin can verify; comma tags become arrays", updated.tags);
    expectStatus(await api("PUT", `/apps/foodvisor/admin/foods/${ctx.oatsId}`, { token: ctx.admin, body: { calories: "abc" } }), 400, "typed validation");
    const bulk = expectStatus(await api("PATCH", "/apps/foodvisor/admin/foods/bulk-verify", { token: ctx.admin, body: { ids: [ctx.oatsId], doctorVerified: false } }), 200, "bulk verify");
    check(bulk.matched === 1 && bulk.modified === 1, "bulk verify counts", bulk);
    expectStatus(await api("POST", "/apps/foodvisor/admin/meal-logs", { token: ctx.admin, body: {} }), 403, "read-only resource");

    const dashboard = expectStatus(await api("GET", "/apps/foodvisor/admin/dashboard", { token: ctx.admin }), 200, "dashboard");
    check(dashboard.totals.foods >= 2705 && dashboard.totals.nutrientIntakeRules === 1181 && dashboard.trend.last30Days.length === 30, "dashboard totals", dashboard.totals);
  });

  await step("foodvisor admin recipes: scoped Content Factory items, string-form fields, review reset on edit", async () => {
    const recipe = expectStatus(
      await api("POST", "/apps/foodvisor/admin/recipes", {
        token: ctx.admin,
        body: {
          title: `Smoke admin bibimbap ${RUN}`,
          category: "lunch",
          attributes: { servings: 2, ingredients: ["Rice", "Spinach", "Egg"], nutritionPerServing: { calories: 520, proteinG: 18 } },
          steps: ["Cook rice", "Top with vegetables"],
          reviewStatus: "published"
        }
      }),
      201,
      "admin create recipe"
    );
    check(recipe.reviewStatus === "draft" && recipe.appCodes.includes("healthy-recipes"), "draft shared with Healthy Recipes (reviewStatus not writable)", recipe);
    for (const action of ["submit", "review", "publish"]) {
      expectStatus(await api("POST", `/content/manage/items/${recipe.id}/${action}`, { token: ctx.admin, body: { approve: true } }), 200, action);
    }
    const detail = expectStatus(await api("GET", `/content/${recipe.id}`, { token: ctx.a.token }), 200, "app detail");
    check(detail.steps[0]?.text === "Cook rice", "string steps normalised for apps", detail.steps);

    const edited = expectStatus(await api("PUT", `/apps/foodvisor/admin/recipes/${recipe.id}`, { token: ctx.admin, body: { title: `Smoke admin bibimbap v2 ${RUN}` } }), 200, "edit published");
    check(edited.reviewStatus === "in_review" && edited.expertReviewed === false && edited.publishedAt === null, "editing sends it back to review", edited);
    expectStatus(await api("GET", `/apps/foodvisor/admin/recipes/${ctx.premiumId}`, { token: ctx.admin }), 404, "Healthy-Recipes-only item is out of Foodvisor scope");
  });

  await step("media: editor image upload with signature check; migrated Foodvisor images served from /static", async () => {
    const origin = new URL(BASE).origin;
    // 1x1 transparent PNG.
    const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const uploaded = expectStatus(
      await api("POST", "/media/images", { token: ctx.admin, body: { mimeType: "image/png", data: png, fileName: "Smoke Pixel.png", folder: "foodvisor/foods" } }),
      201,
      "upload"
    );
    check(uploaded.imageUrl.startsWith("/static/uploads/foodvisor/foods/") && uploaded.imageUrl.endsWith(".png"), "upload url", uploaded);
    const served = await fetch(`${origin}${uploaded.imageUrl}`);
    check(served.status === 200 && served.headers.get("content-type") === "image/png", "uploaded image served", served.status);
    expectStatus(await api("POST", "/media/images", { token: ctx.admin, body: { mimeType: "image/jpeg", data: png } }), 400, "mislabelled jpeg rejected");
    expectStatus(await api("POST", "/media/images", { token: ctx.a.token, body: { mimeType: "image/png", data: png } }), 403, "users cannot upload");

    const withImage = expectStatus(await api("GET", "/apps/foodvisor/admin/foods?imageStatus=downloaded&limit=1", { token: ctx.admin }), 200, "food with image");
    const legacy = withImage.items.find((food: any) => typeof food.imageUrl === "string" && food.imageUrl.startsWith("/static/foodvisor/images/"));
    if (legacy) {
      const image = await fetch(`${origin}${legacy.imageUrl}`);
      check(image.status === 200, "migrated legacy image served", legacy.imageUrl);
    }
  });

  await step("foodvisor user: profile, weight, own targets, intake analysis, LP optimizer, questionnaire", async () => {
    expectStatus(await api("GET", "/apps/foodvisor/daily-targets/me", { token: ctx.a.token }), 400, "targets before profile");
    const profile = expectStatus(
      await api("PUT", "/apps/foodvisor/profile", { token: ctx.a.token, body: { gender: "female", age: 34, heightCm: 165, targetWeightKg: 58, medicalConditions: ["hypertension"] } }),
      200,
      "profile"
    );
    check(profile.age === 34 && profile.medicalConditions[0] === "hypertension", "profile saved", profile);
    const partial = expectStatus(await api("PUT", "/apps/foodvisor/profile", { token: ctx.a.token, body: { goal: "lose_weight" } }), 200, "partial profile");
    check(partial.age === 34 && partial.goal === "lose_weight", "partial update keeps other fields", partial);

    expectStatus(await api("POST", "/apps/foodvisor/weight-entries", { token: ctx.a.token, body: { measuredOn: daysAgo(14), weightKg: 61.5 } }), 201, "weight 1");
    expectStatus(await api("POST", "/apps/foodvisor/weight-entries", { token: ctx.a.token, body: { measuredOn: today, weightKg: 60.2 } }), 201, "weight 2");
    const history = expectStatus(await api("GET", "/apps/foodvisor/weight-entries", { token: ctx.a.token }), 200, "history");
    check(history.latestKg === 60.2 && history.changeKg === -1.3 && history.targetWeightKg === 58, "weight history", history);

    const mine = expectStatus(await api("GET", "/apps/foodvisor/daily-targets/me", { token: ctx.a.token }), 200, "my targets");
    check(mine.profile.gender === "female" && mine.profile.age === 34, "targets from profile", mine.profile);

    const intake = expectStatus(await api("GET", "/apps/foodvisor/daily-intake/analyze", { token: ctx.a.token }), 200, "intake");
    const iron = intake.rows.find((row: any) => row.nutrientKey === "iron");
    check(intake.itemCount >= 2 && iron && iron.intake === 2.35 && typeof iron.percentOfGoal === "number", "50 g oats -> 2.35 mg iron vs target", iron);

    const diet = expectStatus(
      await api("POST", "/apps/foodvisor/diet-optimizer/optimize", {
        token: ctx.a.token,
        body: { constraints: [{ nutrientKey: "proteinG", lowerBound: 60 }, { nutrientKey: "energyKcal", lowerBound: 1200 }], candidateLimit: 200, topPerNutrient: 20 }
      }),
      200,
      "optimize"
    );
    check(diet.feasible === true && diet.totalCalories >= 1200 && diet.constraintSource === "request" && diet.foods.length > 0, "LP diet over imported foods", {
      feasible: diet.feasible,
      totalCalories: diet.totalCalories
    });

    const answers = ctx.questions.slice(0, 12).map((question: any) => ({ questionId: question.questionId, value: question.options[0].value }));
    const survey = expectStatus(await api("POST", "/apps/foodvisor/human-type-surveys/classify", { token: ctx.a.token, body: { answers } }), 201, "classify");
    check(["TE", "SE", "SY", "TY", "MIXED", "REVIEW"].includes(survey.resultType) && survey.answers.length === 12, "survey classified", survey.resultType);
    const reclassified = expectStatus(await api("POST", `/apps/foodvisor/admin/human-type-surveys/${survey.id}/reclassify`, { token: ctx.admin }), 200, "reclassify");
    check(reclassified.resultType === survey.resultType, "reclassify is stable", reclassified.resultType);
    const adminView = expectStatus(await api("GET", `/apps/foodvisor/admin/human-type-surveys/${survey.id}`, { token: ctx.admin }), 200, "admin survey view");
    check(adminView.userEmail === `smoke-a-${RUN}@test.dev`, "admin view joins the account", adminView.userEmail);
  });

  await step("routine engine: expert review gates publishing; app-scoped sessions and progress", async () => {
    const exercise = expectStatus(
      await api("POST", "/routine/exercises", {
        token: ctx.admin,
        body: { name: `Smoke lunge ${RUN}`, appCodes: ["daily-workout"], bodyAreas: ["legs"], defaultReps: 10, safetyNotes: ["Keep knee over ankle"] }
      }),
      201,
      "create exercise"
    );
    expectStatus(await api("POST", `/routine/exercises/${exercise.id}/publish`, { token: ctx.admin }), 409, "publish unreviewed exercise");
    expectStatus(await api("POST", `/routine/exercises/${exercise.id}/review`, { token: ctx.admin, body: { approve: true } }), 200, "review exercise");
    expectStatus(await api("POST", `/routine/exercises/${exercise.id}/publish`, { token: ctx.admin }), 200, "publish exercise");

    expectStatus(
      await api("POST", "/routine/routines", { token: ctx.admin, body: { appCode: "daily-yoga", title: "Wrong app", steps: [{ exerciseId: exercise.id }] } }),
      400,
      "exercise not enabled for app"
    );
    const routine = expectStatus(
      await api("POST", "/routine/routines", {
        token: ctx.admin,
        // A run-specific tag finds this routine among the ones earlier runs left behind.
        body: { appCode: "daily-workout", title: `Smoke legs ${RUN}`, estimatedMinutes: 10, tags: [`smoke-${RUN}`], steps: [{ exerciseId: exercise.id, sets: 3, reps: 10, restSeconds: 30 }] }
      }),
      201,
      "create routine"
    );
    expectStatus(await api("POST", `/routine/routines/${routine.id}/review`, { token: ctx.admin, body: { approve: true } }), 200, "review routine");
    expectStatus(await api("POST", `/routine/routines/${routine.id}/publish`, { token: ctx.admin }), 200, "publish routine");
    ctx.routineId = routine.id;

    const listed = expectStatus(await api("GET", `/apps/daily-workout/routines?tag=smoke-${RUN}`, { token: ctx.a.token }), 200, "list routines");
    check(listed.items.some((item: any) => item.id === routine.id), "routine visible in Daily Workout", listed);
    expectStatus(await api("GET", `/apps/daily-yoga/routines/${routine.id}`, { token: ctx.a.token }), 404, "not visible in Daily Yoga");

    const session = expectStatus(await api("POST", "/apps/daily-workout/sessions", { token: ctx.a.token, body: { routineId: routine.id } }), 201, "start");
    const done = expectStatus(
      await api("POST", `/apps/daily-workout/sessions/${session.id}/complete`, { token: ctx.a.token, body: { completedSteps: 1, durationSeconds: 600, perceivedEffort: 6 } }),
      200,
      "complete"
    );
    check(done.status === "completed", "session completed", done);
    expectStatus(await api("POST", `/apps/daily-workout/sessions/${session.id}/abandon`, { token: ctx.a.token }), 409, "closed session");
    const progress = expectStatus(await api("GET", "/apps/daily-workout/progress", { token: ctx.a.token }), 200, "progress");
    check(progress.currentStreakDays === 1 && progress.thisWeek.minutes === 10, "streak and minutes", progress);

    const seeded = expectStatus(await api("GET", "/apps/daily-yoga/routines", { token: ctx.a.token }), 200, "seeded yoga routines");
    check(seeded.items.length >= 1, "seeded yoga routine should be listed", seeded);
  });

  await step("consent: Workout activity appears in Foodvisor only after explicit consent", async () => {
    const consent = expectStatus(
      await api("POST", "/consents", { token: ctx.a.token, body: { sourceApp: "daily-workout", targetApp: "foodvisor", scope: "activity_summary" } }),
      201,
      "grant"
    );
    const summary = expectStatus(await api("GET", `/apps/foodvisor/daily-summary?date=${today}`, { token: ctx.a.token }), 200, "summary");
    check(summary.connectedActivity[0]?.appCode === "daily-workout" && summary.connectedActivity[0].minutes === 10, "activity shared", summary);
    expectStatus(await api("DELETE", `/consents/${consent.id}`, { token: ctx.a.token }), 204, "revoke");
    const revoked = expectStatus(await api("GET", `/apps/foodvisor/daily-summary?date=${today}`, { token: ctx.a.token }), 200, "summary after revoke");
    check(revoked.connectedActivity.length === 0, "activity hidden after revoke", revoked);
  });

  await step("recommendations: intent-triggered, hidden once installed, honours opt-out; KPIs", async () => {
    expectStatus(await api("POST", "/analytics/events", { token: ctx.a.token, body: { events: [{ name: "x" }] } }), 400, "missing app header");
    const tracked = expectStatus(
      await api("POST", "/analytics/events", { token: ctx.a.token, app: "foodvisor", body: { events: [{ name: "exercise_goal_selected", properties: { goal: "fitness" } }] } }),
      202,
      "track"
    );
    check(tracked.accepted === 1, "one event accepted", tracked);
    expectStatus(await api("POST", "/analytics/events", { app: "foodvisor", body: { events: [{ name: "app_opened", anonymousId: `anon-${RUN}-device` }] } }), 202, "anonymous event");

    const feed = expectStatus(await api("GET", "/recommendations?limit=3", { token: ctx.a.token, app: "foodvisor" }), 200, "feed");
    check(feed.length === 1 && feed[0].targetApp.code === "daily-workout", "exercise goal -> Daily Workout only", feed);
    expectStatus(await api("POST", `/recommendations/${feed[0].ruleId}/interactions`, { token: ctx.a.token, body: { action: "impression" } }), 201, "impression");
    expectStatus(await api("POST", `/recommendations/${feed[0].ruleId}/interactions`, { token: ctx.a.token, body: { action: "click" } }), 201, "click");

    expectStatus(await api("PATCH", "/users/me", { token: ctx.a.token, body: { crossAppRecommendations: false } }), 200, "opt out");
    const optedOut = expectStatus(await api("GET", "/recommendations", { token: ctx.a.token, app: "foodvisor" }), 200, "feed opted out");
    check(optedOut.length === 0, "no recommendations after opt-out", optedOut);
    expectStatus(await api("PATCH", "/users/me", { token: ctx.a.token, body: { crossAppRecommendations: true } }), 200, "opt in");

    expectStatus(await api("POST", "/users/me/apps/daily-workout/open", { token: ctx.a.token }), 200, "open target app");
    const afterInstall = expectStatus(await api("GET", "/recommendations", { token: ctx.a.token, app: "foodvisor" }), 200, "feed after install");
    check(afterInstall.length === 0, "installed apps are not recommended", afterInstall);

    const stats = expectStatus(await api("GET", `/recommendations/stats?from=${today}&to=${today}`, { token: ctx.admin }), 200, "stats");
    const rule = stats.find((row: any) => row.ruleId === feed[0].ruleId);
    check(rule && rule.impressions >= 1 && rule.clicks >= 1, "rule stats", rule);
    const kpis = expectStatus(await api("GET", `/analytics/kpis?app=foodvisor&from=${today}&to=${today}`, { token: ctx.admin }), 200, "kpis");
    check(kpis.activeUsers >= 1 && kpis.anonymousVisitors >= 1 && kpis.retention.cohortSize >= 1, "kpis", kpis);
  });

  await step("notifications: device registration and reminders", async () => {
    expectStatus(await api("POST", "/notifications/devices", { token: ctx.a.token, app: "daily-yoga", body: { platform: "android", pushToken: `fcm-${RUN}-token-value` } }), 201, "device");
    const reminder = expectStatus(
      await api("POST", "/notifications/reminders", {
        token: ctx.a.token,
        app: "daily-yoga",
        body: { title: "Evening yoga", timeOfDay: "20:30", daysOfWeek: [1, 3, 5], timezone: "Asia/Seoul" }
      }),
      201,
      "reminder"
    );
    check(reminder.timeOfDay === "20:30", "time round-trips as HH:MM", reminder);
    expectStatus(await api("POST", "/notifications/reminders", { token: ctx.a.token, app: "daily-yoga", body: { title: "x", timeOfDay: "07:00", timezone: "Mars/Base" } }), 400, "bad timezone");
    const listed = expectStatus(await api("GET", "/notifications/reminders", { token: ctx.a.token, app: "foodvisor" }), 200, "other app");
    check(listed.length === 0, "reminders are scoped per app", listed);
  });

  await step("babygrow: caregiver sharing, role checks, care logs, premium growth report, milestones", async () => {
    const child = expectStatus(await api("POST", "/apps/babygrow/children", { token: ctx.b.token, body: { name: "Mina", birthDate: daysAgo(300), sex: "female" } }), 201, "child");
    check(child.myRole === "owner" && child.ageMonths >= 9, "owner and age", child);
    expectStatus(await api("GET", `/apps/babygrow/children/${child.id}`, { token: ctx.a.token }), 404, "stranger cannot see child");
    expectStatus(await api("POST", `/apps/babygrow/children/${child.id}/caregivers`, { token: ctx.b.token, body: { email: `smoke-a-${RUN}@test.dev`, role: "viewer" } }), 201, "share");
    const shared = expectStatus(await api("GET", "/apps/babygrow/children", { token: ctx.a.token }), 200, "viewer list");
    check(shared[0]?.myRole === "viewer", "shared as viewer", shared);
    expectStatus(await api("POST", `/apps/babygrow/children/${child.id}/growth-records`, { token: ctx.a.token, body: { measuredOn: daysAgo(10), heightCm: 70 } }), 403, "viewer cannot write");

    expectStatus(await api("POST", `/apps/babygrow/children/${child.id}/growth-records`, { token: ctx.b.token, body: { measuredOn: daysAgo(70), heightCm: 68.0, weightKg: 8.1 } }), 201, "growth 1");
    expectStatus(await api("POST", `/apps/babygrow/children/${child.id}/growth-records`, { token: ctx.b.token, body: { measuredOn: daysAgo(10), heightCm: 71.0, weightKg: 8.7 } }), 201, "growth 2");
    const gated = await api("GET", `/apps/babygrow/children/${child.id}/growth-records/report`, { token: ctx.b.token });
    check(gated.status === 403 && gated.body?.error?.code === "ENTITLEMENT_REQUIRED", "report is premium", gated.body);
    expectStatus(
      await api("POST", "/subscriptions/purchases/verify", { token: ctx.b.token, app: "babygrow", body: { store: "dev", productId: "dev.babygrow_pro_monthly", purchaseToken: `smoke-bg-${RUN}` } }),
      201,
      "buy BabyGrow Pro"
    );
    const report = expectStatus(await api("GET", `/apps/babygrow/children/${child.id}/growth-records/report`, { token: ctx.b.token }), 200, "report");
    check(report.changes[0]?.heightCmPer30Days === 1.5, "3 cm over 60 days = 1.5 cm / 30 days", report);

    // Fixed UTC times on a past day keep the day-summary assertion independent of when the test runs.
    const logDay = daysAgo(1);
    expectStatus(
      await api("POST", `/apps/babygrow/children/${child.id}/care-logs`, {
        token: ctx.b.token,
        body: { logType: "feeding", startedAt: `${logDay}T12:00:00Z`, details: { method: "bottle", amountMl: 120 } }
      }),
      201,
      "feeding"
    );
    expectStatus(
      await api("POST", `/apps/babygrow/children/${child.id}/care-logs`, {
        token: ctx.b.token,
        body: { logType: "sleep", startedAt: `${logDay}T13:00:00Z`, endedAt: `${logDay}T14:00:00Z` }
      }),
      201,
      "sleep"
    );
    const summary = expectStatus(
      await api("GET", `/apps/babygrow/children/${child.id}/care-logs/summary?date=${logDay}&timezone=UTC`, { token: ctx.b.token }),
      200,
      "care summary"
    );
    check(summary.feedings === 1 && summary.feedingMl === 120 && summary.sleepMinutes === 60, "care day totals", summary);

    // Editors add milestones through the admin kit; families only see published ones.
    const definition = expectStatus(
      await api("POST", "/apps/babygrow/admin/milestone-definitions", {
        token: ctx.admin,
        body: { month: 9, milestoneType: "physical", title: `Sits without support ${RUN}`, question: "Can your baby sit without support?", expertReviewed: true }
      }),
      201,
      "definition"
    );
    check(definition.expertReviewed === false && definition.isPublished === false, "new definitions start unreviewed and unpublished", definition);
    let milestones = expectStatus(await api("GET", `/apps/babygrow/children/${child.id}/milestones?month=9`, { token: ctx.b.token }), 200, "milestones");
    check(!milestones.some((m: any) => m.milestoneId === definition.id), "unpublished definitions are hidden", milestones);
    expectStatus(await api("PUT", `/apps/babygrow/admin/milestone-definitions/${definition.id}`, { token: ctx.admin, body: { isPublished: true } }), 200, "publish definition");
    expectStatus(await api("POST", `/apps/babygrow/milestone-definitions/${definition.id}/review`, { token: ctx.b.token, body: { approve: true } }), 403, "only admins review");
    expectStatus(await api("POST", `/apps/babygrow/milestone-definitions/${definition.id}/review`, { token: ctx.admin, body: { approve: true } }), 200, "review definition");
    const recorded = expectStatus(
      await api("PUT", `/apps/babygrow/children/${child.id}/milestones/${definition.id}`, { token: ctx.b.token, body: { status: "yes", achievedOn: daysAgo(5) } }),
      200,
      "record"
    );
    check(recorded.status === "yes" && recorded.expertReviewed === true, "milestone answered", recorded);
    milestones = expectStatus(await api("GET", `/apps/babygrow/children/${child.id}/milestones?month=9`, { token: ctx.b.token }), 200, "milestones after");
    check(milestones.find((m: any) => m.milestoneId === definition.id)?.achievedOn === daysAgo(5), "milestone recorded", milestones);
    const milestoneReport = expectStatus(await api("GET", `/apps/babygrow/children/${child.id}/milestones/report?month=9`, { token: ctx.b.token }), 200, "milestone report");
    check(milestoneReport.yes >= 1 && milestoneReport.total >= milestoneReport.yes, "milestone report counts", milestoneReport);
    const byMonth = expectStatus(await api("GET", "/apps/babygrow/milestone-definitions/month/9", { token: ctx.b.token }), 200, "definitions by month");
    check(byMonth.physical.some((m: any) => m.id === definition.id), "grouped by type", byMonth);
    ctx.childId = child.id;
  });

  await step("babygrow: profile, active child, care views, activity library, daily plan, recipes, stories", async () => {
    const childId = ctx.childId;
    const profile = expectStatus(
      await api("PUT", "/apps/babygrow/profile", { token: ctx.b.token, body: { fullName: "Mina's mum", relationToBaby: "mother", phoneNumber: "010-0000-0000" } }),
      200,
      "profile"
    );
    check(profile.fullName === "Mina's mum" && profile.relationToBaby === "mother", "profile saved", profile);
    const active = expectStatus(await api("GET", "/apps/babygrow/profile/active-child", { token: ctx.b.token }), 200, "active child");
    check(active?.id === childId, "first child is active by default", active);
    expectStatus(await api("PUT", "/apps/babygrow/profile/active-child", { token: ctx.a.token, body: { childId: "00000000-0000-4000-8000-000000000000" } }), 404, "unknown child");

    expectStatus(
      await api("POST", `/apps/babygrow/children/${childId}/feedings`, { token: ctx.b.token, body: { feedingType: "bottle", startTime: new Date().toISOString(), amountMl: 90 } }),
      201,
      "feeding view"
    );
    const feedings = expectStatus(await api("GET", `/apps/babygrow/children/${childId}/feedings`, { token: ctx.b.token }), 200, "feedings");
    check(feedings.some((f: any) => f.amountMl === 90 && f.feedingType === "bottle"), "feeding listed", feedings);
    expectStatus(await api("POST", `/apps/babygrow/children/${childId}/diapers`, { token: ctx.a.token, body: { diaperType: "wet", changeTime: new Date().toISOString() } }), 403, "viewer cannot log");

    const activities = expectStatus(await api("GET", "/apps/babygrow/activities?month=9&category=physical", { token: ctx.b.token }), 200, "activities");
    check(activities.length > 0 && activities.every((a: any) => a.category === "physical" && a.monthMin <= 9 && a.monthMax >= 9), "imported activities by age", activities[0]);
    const subCategories = expectStatus(await api("GET", "/apps/babygrow/activities/sub-categories", { token: ctx.b.token }), 200, "sub-categories");
    check(subCategories.length > 0, "sub-categories", subCategories);
    const plan = expectStatus(await api("GET", `/apps/babygrow/children/${childId}/daily-activities`, { token: ctx.b.token }), 200, "daily plan");
    check(plan.length === 4 && plan.map((p: any) => p.slot).join() === "1,2,3,4", "four daily slots", plan);
    const again = expectStatus(await api("GET", `/apps/babygrow/children/${childId}/daily-activities`, { token: ctx.b.token }), 200, "daily plan again");
    check(again.map((p: any) => p.activity.id).join() === plan.map((p: any) => p.activity.id).join(), "plan is stable for the day", again);
    const done = expectStatus(await api("POST", `/apps/babygrow/children/${childId}/daily-activities/1/complete`, { token: ctx.b.token }), 200, "complete slot");
    check(done.isCompleted === true, "slot completed", done);
    expectStatus(
      await api("POST", `/apps/babygrow/children/${childId}/activities/${activities[0].id}/complete`, { token: ctx.b.token, body: { rating: 5, difficultyFeedback: "just_right" } }),
      201,
      "complete activity"
    );
    const history = expectStatus(await api("GET", `/apps/babygrow/children/${childId}/activities`, { token: ctx.b.token }), 200, "history");
    check(history.length >= 2, "slot and activity logged", history);

    const updates = expectStatus(await api("GET", "/apps/babygrow/daily-updates?ageInMonths=0", { token: ctx.b.token }), 200, "daily updates");
    check(updates.length === 3, "three month-0 updates", updates);
    expectStatus(await api("GET", `/apps/babygrow/children/${childId}/daily-updates/today`, { token: ctx.b.token }), 200, "today's updates");

    const recipes = expectStatus(await api("GET", "/apps/babygrow/recipes/age-group/7-11", { token: ctx.b.token }), 200, "recipes by age group");
    check(recipes.length > 0 && recipes.every((r: any) => r.ageGroup === "7-11"), "age-group recipes", recipes[0]);
    const withImage = recipes.find((r: any) => r.imageUrl);
    check(!withImage || withImage.imageUrl.startsWith("/static/babygrow/images/"), "legacy image URLs rewritten", withImage);
    expectStatus(await api("GET", "/apps/babygrow/recipes/age-group/99", { token: ctx.b.token }), 400, "unknown age group");
    expectStatus(await api("PUT", `/apps/babygrow/recipes/${recipes[0].id}/favorite`, { token: ctx.b.token }), 200, "favorite");
    const favorites = expectStatus(await api("GET", "/apps/babygrow/recipes/favorites", { token: ctx.b.token }), 200, "favorites");
    check(favorites.some((r: any) => r.id === recipes[0].id && r.isFavorite), "favorite listed", favorites);
    const childRecipes = expectStatus(await api("GET", `/apps/babygrow/children/${childId}/recipes`, { token: ctx.b.token }), 200, "child recipes");
    check(childRecipes.length > 0 && childRecipes[0].ageGroup === "7-11", "9-month-old gets 7-11 recipes", childRecipes[0]);

    const stories = expectStatus(await api("GET", "/apps/babygrow/stories?ageMonths=9", { token: ctx.b.token }), 200, "stories");
    check(stories.length > 0 && stories[0].content, "stories with text", stories[0]);
    expectStatus(await api("PUT", `/apps/babygrow/stories/${stories[0].id}/bookmark`, { token: ctx.b.token }), 200, "bookmark story");
    const bookmarked = expectStatus(await api("GET", "/apps/babygrow/stories/bookmarked", { token: ctx.b.token }), 200, "bookmarked stories");
    check(bookmarked.length === 1 && bookmarked[0].isBookmarked, "story bookmarked", bookmarked);
    expectStatus(await api("PUT", `/apps/babygrow/stories/${recipes[0].id}/bookmark`, { token: ctx.b.token }), 404, "recipe id is not a story");
  });

  await step("babygrow admin: content slices, review flag, read-only views, dashboard", async () => {
    const list = expectStatus(await api("GET", "/apps/babygrow/admin/activities?category=physical&limit=2&sort=title", { token: ctx.admin }), 200, "admin activities");
    check(list.total >= 100 && list.items.length === 2 && list.items.every((i: any) => i.category === "physical"), "activities slice", list);
    expectStatus(await api("GET", "/apps/babygrow/admin/activities", { token: ctx.b.token }), 403, "non-editor blocked");
    const created = expectStatus(
      await api("POST", "/apps/babygrow/admin/stories", {
        token: ctx.admin,
        body: { title: `Smoke story ${RUN}`, body: "Once upon a time.", category: "Bedtime", attributes: { ageMonthsMin: 0, ageMonthsMax: 72 }, expertReviewed: true }
      }),
      201,
      "create story"
    );
    check(created.reviewStatus === "published" && created.expertReviewed === false, "admin content is live but unreviewed", created);
    const story = expectStatus(await api("GET", `/apps/babygrow/stories/${created.id}`, { token: ctx.b.token }), 200, "story visible in app");
    check(story.expertReviewed === false, "unreviewed badge", story);
    const verified = expectStatus(await api("PATCH", "/apps/babygrow/admin/stories/bulk-verify", { token: ctx.admin, body: { ids: [created.id], doctorVerified: true } }), 200, "bulk verify");
    check(verified.modified === 1, "verified", verified);
    const foodvisorRecipes = expectStatus(await api("GET", `/apps/foodvisor/admin/recipes?limit=500`, { token: ctx.admin }), 200, "foodvisor recipes");
    check(!foodvisorRecipes.items.some((r: any) => r.title === `Smoke story ${RUN}`), "slices do not leak across apps", foodvisorRecipes.total);
    expectStatus(await api("DELETE", `/apps/babygrow/admin/stories/${created.id}`, { token: ctx.admin }), 204, "delete story");

    const children = expectStatus(await api("GET", `/apps/babygrow/admin/children?q=smoke-b-${RUN}`, { token: ctx.admin }), 200, "admin children");
    check(children.items.length === 1 && children.items[0].caregiverCount === 2, "child with owner and caregivers", children);
    const parents = expectStatus(await api("GET", `/apps/babygrow/admin/parents?q=smoke-b-${RUN}`, { token: ctx.admin }), 200, "admin parents");
    check(parents.items[0]?.relationToBaby === "mother" && parents.items[0]?.childCount === 1, "caregiver profile", parents);
    expectStatus(await api("DELETE", `/apps/babygrow/admin/parents/${parents.items[0].id}`, { token: ctx.admin }), 403, "parents are read-only");
    const dashboard = expectStatus(await api("GET", "/apps/babygrow/admin/dashboard", { token: ctx.admin }), 200, "dashboard");
    check(dashboard && typeof dashboard === "object", "dashboard payload", dashboard);
  });

  await step("height-increase: measurements, observed trend and posture programs", async () => {
    expectStatus(await api("POST", "/apps/height-increase/measurements", { token: ctx.a.token, body: { measuredOn: daysAgo(61), heightCm: 160.0 } }), 201, "m1");
    expectStatus(await api("POST", "/apps/height-increase/measurements", { token: ctx.a.token, body: { measuredOn: today, heightCm: 161.0 } }), 201, "m2");
    expectStatus(await api("POST", "/apps/height-increase/measurements", { token: ctx.a.token, body: { measuredOn: today, heightCm: 161.2 } }), 201, "same-day replace");
    const trend = expectStatus(await api("GET", "/apps/height-increase/measurements", { token: ctx.a.token }), 200, "trend");
    check(trend.measurements.length === 2 && trend.totalChangeCm === 1.2, "trend", trend);
    const programs = expectStatus(await api("GET", "/apps/height-increase/routines", { token: ctx.a.token }), 200, "programs");
    check(programs.items.length >= 1, "seeded posture program", programs);
  });

  await step("height-increase app: public catalog, profile, daily logs, reports, goals", async () => {
    const home = expectStatus(await api("GET", "/apps/height-increase/home"), 200, "public home");
    check(Array.isArray(home.banners) && Array.isArray(home.articles), "home payload", home);
    const exercises = expectStatus(await api("GET", "/apps/height-increase/exercises"), 200, "public exercises");
    check(!exercises.some((e: any) => e.title === "Jumping Jacks"), "imported drafts stay hidden until reviewed", exercises.map((e: any) => e.title));

    const profile = expectStatus(await api("GET", "/apps/height-increase/profile", { token: ctx.a.token }), 200, "profile");
    check(profile.measurements.currentHeightCm === 161.2, "current height from measurements", profile);
    const updated = expectStatus(
      await api("PATCH", "/apps/height-increase/profile", { token: ctx.a.token, body: { targetHeightCm: 170, units: "imperial", name: `Smoke A ${RUN}` } }),
      200,
      "update profile"
    );
    check(updated.measurements.targetHeightCm === 170 && updated.preferences.units === "imperial" && updated.name === `Smoke A ${RUN}`, "profile saved", updated);

    expectStatus(
      await api("POST", "/apps/height-increase/logs", { token: ctx.a.token, body: { date: today, sleepHours: 8, workoutMinutes: 15, heightCm: 161.4 } }),
      201,
      "log"
    );
    const again = expectStatus(await api("POST", "/apps/height-increase/logs", { token: ctx.a.token, body: { date: today, waterGlasses: 6 } }), 201, "same-day log");
    check(again.sleepHours === 8 && again.waterGlasses === 6, "same-day save keeps earlier fields", again);
    expectStatus(await api("POST", "/apps/height-increase/logs", { token: ctx.a.token, body: { date: "2999-01-01" } }), 400, "future log");
    const trend = expectStatus(await api("GET", "/apps/height-increase/measurements", { token: ctx.a.token }), 200, "trend after log");
    check(trend.measurements[trend.measurements.length - 1].heightCm === 161.4, "logged height recorded as a measurement", trend);
    const report = expectStatus(await api("GET", "/apps/height-increase/reports", { token: ctx.a.token }), 200, "report");
    check(report.summary.workoutMinutes === 15 && report.summary.averageSleepHours === 8 && report.summary.targetHeightCm === 170, "report summary", report.summary);

    const goal = expectStatus(
      await api("POST", "/apps/height-increase/goals", { token: ctx.a.token, body: { title: "Stretch daily", type: "workout", targetValue: 30, unit: "days" } }),
      201,
      "goal"
    );
    const done = expectStatus(await api("PATCH", `/apps/height-increase/goals/${goal.id}`, { token: ctx.a.token, body: { currentValue: 30, status: "completed" } }), 200, "complete goal");
    check(done.status === "completed", "goal completed", done);
    expectStatus(await api("PATCH", `/apps/height-increase/goals/${goal.id}`, { token: ctx.b.token, body: { status: "cancelled" } }), 404, "other users' goals");
  });

  await step("height-increase admin: legacy fields, jsonb merges, plan exercises, review workflow, blocking", async () => {
    expectStatus(await api("GET", "/apps/height-increase/admin/stats", { token: ctx.a.token }), 403, "non-editor blocked");
    const stats = expectStatus(await api("GET", "/apps/height-increase/admin/stats", { token: ctx.admin }), 200, "stats");
    check(stats.totals.users >= 1 && stats.charts.contentMix.length === 4, "stats payload", stats);

    const imported = expectStatus(await api("GET", "/apps/height-increase/admin/exercises?q=Jumping", { token: ctx.admin }), 200, "admin exercises");
    const jacks = imported.items[0];
    check(jacks?.category === "cardio" && jacks.status === "draft" && jacks.isActive === false && jacks.doctor_verified === false, "imported exercise", jacks);

    const exercise = expectStatus(
      await api("POST", "/apps/height-increase/admin/exercises", {
        token: ctx.admin,
        body: { title: `Smoke stretch ${RUN}`, category: "stretching", durationSeconds: 30, imageUrl: "/static/x.png", steps: ["Reach up", "Hold"] }
      }),
      201,
      "create exercise"
    );
    check(exercise.category === "stretching" && exercise.steps.length === 2 && exercise.imageUrl === "/static/x.png", "jsonKey fields stored", exercise);
    const patched = expectStatus(await api("PATCH", `/apps/height-increase/admin/exercises/${exercise.id}`, { token: ctx.admin, body: { calories: 9 } }), 200, "patch exercise");
    check(patched.calories === 9 && patched.category === "stretching" && patched.steps.length === 2, "patch merges attributes", patched);
    const sorted = expectStatus(await api("GET", "/apps/height-increase/admin/exercises?category=stretching&sort=sortOrder", { token: ctx.admin }), 200, "filter on jsonKey");
    check(sorted.items.every((e: any) => e.category === "stretching"), "attribute filter", sorted.items.map((e: any) => e.category));

    const plan = expectStatus(
      await api("POST", "/apps/height-increase/admin/training-plans", {
        token: ctx.admin,
        body: { title: `Smoke plan ${RUN}`, level: "beginner", type: "daily", exercises: [{ exercise: exercise.id, order: 1, sets: 2, restSeconds: 15 }] }
      }),
      201,
      "create plan"
    );
    check(plan.exercises.length === 1 && plan.exercises[0].sets === 2 && plan.type === "daily" && plan.status === "draft", "plan with exercises", plan);
    expectStatus(
      await api("PATCH", `/apps/height-increase/admin/training-plans/${plan.id}`, { token: ctx.admin, body: { exercises: [{ exercise: "00000000-0000-4000-8000-000000000000" }] } }),
      400,
      "unknown plan exercise"
    );

    // Going live is the Routine Engine's expert workflow, not an admin field.
    expectStatus(await api("POST", `/routine/routines/${plan.id}/publish`, { token: ctx.admin }), 409, "unreviewed plan cannot publish");
    expectStatus(await api("POST", `/routine/exercises/${exercise.id}/review`, { token: ctx.admin, body: { approve: true } }), 200, "review exercise");
    expectStatus(await api("POST", `/routine/exercises/${exercise.id}/publish`, { token: ctx.admin }), 200, "publish exercise");
    expectStatus(await api("POST", `/routine/routines/${plan.id}/review`, { token: ctx.admin, body: { approve: true } }), 200, "review plan");
    expectStatus(await api("POST", `/routine/routines/${plan.id}/publish`, { token: ctx.admin }), 200, "publish plan");
    const live = expectStatus(await api("GET", "/apps/height-increase/training-plans?type=daily"), 200, "public plans");
    check(live.some((p: any) => p.id === plan.id && p.stepCount === 1), "published plan is public", live);
    const after = expectStatus(await api("GET", `/apps/height-increase/admin/exercises/${exercise.id}`, { token: ctx.admin }), 200, "exercise after publish");
    check(after.isActive === true && after.doctor_verified === true, "isActive mirrors status", after);
    const edited = expectStatus(await api("PATCH", `/apps/height-increase/admin/exercises/${exercise.id}`, { token: ctx.admin, body: { tips: ["Breathe"] } }), 200, "edit live exercise");
    check(edited.status === "draft" && edited.doctor_verified === false, "editing withdraws the exercise", edited);
    // Keep the dev catalog clean: the fixture plan would otherwise become the home screen's featured plan.
    expectStatus(await api("POST", `/routine/routines/${plan.id}/archive`, { token: ctx.admin }), 200, "archive fixture plan");

    const articles = expectStatus(await api("GET", "/apps/height-increase/articles"), 200, "public articles");
    check(articles.length >= 4 && articles.every((a: any) => a.expertReviewed === false || a.expertReviewed === true), "imported articles are live", articles.length);

    const users = expectStatus(await api("GET", `/apps/height-increase/admin/users?q=smoke-a-${RUN}`, { token: ctx.admin }), 200, "admin users");
    const profile = users.items[0];
    check(profile?.currentHeightCm === 161.4 && profile.targetHeightCm === 170, "user view joins measurements", profile);
    expectStatus(await api("PATCH", `/apps/height-increase/admin/users/${profile.id}`, { token: ctx.admin, body: { status: "blocked" } }), 200, "block");
    expectStatus(await api("GET", "/apps/height-increase/profile", { token: ctx.a.token }), 403, "blocked user");
    expectStatus(await api("PATCH", `/apps/height-increase/admin/users/${profile.id}`, { token: ctx.admin, body: { status: "active" } }), 200, "unblock");
    expectStatus(await api("DELETE", `/apps/height-increase/admin/users/${profile.id}`, { token: ctx.admin }), 403, "accounts are not deleted here");

    const logs = expectStatus(await api("GET", `/apps/height-increase/admin/logs?q=smoke-a-${RUN}`, { token: ctx.admin }), 200, "admin logs");
    check(logs.items[0]?.waterGlasses === 6 && logs.items[0]?.userEmail === `smoke-a-${RUN}@test.dev`, "admin log view", logs.items[0]);
  });

  await step("platform admin: overview, accounts and roles, purchases, plans, audit log", async () => {
    expectStatus(await api("GET", "/admin/overview", { token: ctx.a.token }), 403, "non-admin blocked");
    const overview = expectStatus(await api("GET", "/admin/overview", { token: ctx.admin }), 200, "overview");
    check(overview.accounts.admins >= 1 && overview.apps.some((app: any) => app.code === "babygrow"), "overview payload", overview);

    const accounts = expectStatus(await api("GET", `/admin/accounts?q=smoke-a-${RUN}`, { token: ctx.admin }), 200, "accounts");
    const account = accounts.items[0];
    check(account?.role === "user" && account.apps.length >= 1 && account.activePurchases >= 1, "account view", account);
    const promoted = expectStatus(await api("PATCH", `/admin/accounts/${account.id}`, { token: ctx.admin, body: { role: "editor" } }), 200, "promote");
    check(promoted.role === "editor", "role changed", promoted);
    expectStatus(await api("PATCH", `/admin/accounts/${account.id}`, { token: ctx.admin, body: { role: "user" } }), 200, "demote");
    expectStatus(await api("PATCH", `/admin/accounts/${account.id}`, { token: ctx.admin, body: { email: "x@y.z" } }), 200, "email is read-only (ignored)");
    expectStatus(await api("DELETE", `/admin/accounts/${account.id}`, { token: ctx.admin }), 403, "accounts are not deleted from the admin");
    const me = expectStatus(await api("GET", "/admin/accounts?role=admin&q=admin@wellness.local", { token: ctx.admin }), 200, "admin account");
    expectStatus(await api("PATCH", `/admin/accounts/${me.items[0].id}`, { token: ctx.admin, body: { role: "user" } }), 403, "own role is locked");

    const purchases = expectStatus(await api("GET", `/admin/purchases?q=smoke-a-${RUN}`, { token: ctx.admin }), 200, "purchases");
    check(purchases.items[0]?.tier === "wellness_pass" && purchases.items[0].unlocks.length > 1, "purchase view", purchases.items[0]);
    const plans = expectStatus(await api("GET", "/admin/plans?tier=wellness_pass", { token: ctx.admin }), 200, "plans");
    check(plans.items.length >= 1 && plans.items.every((plan: any) => plan.tier === "wellness_pass"), "plan view", plans.items);
    const audit = expectStatus(await api("GET", "/admin/audit-logs?resource=accounts&limit=5", { token: ctx.admin }), 200, "audit log");
    check(audit.items.length >= 2 && audit.items[0].actorEmail === "admin@wellness.local", "role changes are audited", audit.items[0]);
  });

  await step("subscriptions: store refund notification revokes access", async () => {
    expectStatus(await api("POST", "/subscriptions/webhooks/dev", { body: { originalTransactionId: ctx.passToken, type: "REFUNDED" } }), 200, "webhook");
    const entitlements = expectStatus(await api("GET", "/subscriptions/entitlements", { token: ctx.a.token }), 200, "entitlements");
    check(entitlements.tier === "free", "refund should remove the Wellness Pass", entitlements);
  });

  await step("identity: account deletion erases the account", async () => {
    const d = await register(`smoke-d-${RUN}@test.dev`, "foodvisor");
    expectStatus(await api("DELETE", "/users/me", { token: d.token }), 204, "delete");
    expectStatus(await api("POST", "/auth/login", { body: { email: `smoke-d-${RUN}@test.dev`, password: "Password123!" } }), 401, "login after delete");
  });

  process.stdout.write(`\n${passed} passed, ${failures.length} failed\n`);
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  process.stdout.write(`Smoke test crashed: ${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
