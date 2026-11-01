import { babygrowModule } from "./apps/babygrow/babygrow-module.js";
import { dailyWorkoutModule } from "./apps/daily-workout/daily-workout-module.js";
import { dailyYogaModule } from "./apps/daily-yoga/daily-yoga-module.js";
import { foodvisorModule } from "./apps/foodvisor/foodvisor-module.js";
import { healthyRecipesModule } from "./apps/healthy-recipes/healthy-recipes-module.js";
import { heightIncreaseModule } from "./apps/height-increase/height-increase-module.js";
import type { WellnessModule } from "./module.js";
import { adminModule } from "./platform/admin/admin-module.js";
import { analyticsModule } from "./platform/analytics/analytics-module.js";
import { contentModule } from "./platform/content/content-module.js";
import { identityModule } from "./platform/identity/identity-module.js";
import { mediaModule } from "./platform/media/media-module.js";
import { notificationModule } from "./platform/notification/notification-module.js";
import { recommendationModule } from "./platform/recommendation/recommendation-module.js";
import { routineModule } from "./platform/routine/routine-module.js";
import { subscriptionModule } from "./platform/subscription/subscription-module.js";

/**
 * Mount order for every module. To add an app: create src/modules/apps/<app>/, add its
 * migration as database/migrations/1NN_app_<app>.sql, set `backendModule: true` in
 * config/app-catalog.ts and register its module here.
 */
export const modules: WellnessModule[] = [
  identityModule,
  subscriptionModule,
  contentModule,
  routineModule,
  analyticsModule,
  notificationModule,
  recommendationModule,
  mediaModule,
  adminModule,
  babygrowModule,
  foodvisorModule,
  heightIncreaseModule,
  healthyRecipesModule,
  dailyWorkoutModule,
  dailyYogaModule
];
