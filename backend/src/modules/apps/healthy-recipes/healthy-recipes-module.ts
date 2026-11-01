import { Router } from "express";
import { fixedAppContext } from "../../../middleware/app-context.js";
import { authenticate } from "../../../middleware/auth.js";
import type { WellnessModule } from "../../module.js";
import { mealPlanRouter } from "./routes/meal-plan-routes.js";
import { recipeRouter } from "./routes/recipe-routes.js";
import { savedRecipeRouter } from "./routes/saved-recipe-routes.js";

const router = Router();
router.use(fixedAppContext("healthy-recipes"), authenticate);
router.use("/recipes", recipeRouter);
router.use("/saved-recipes", savedRecipeRouter);
router.use("/meal-plans", mealPlanRouter);

export const healthyRecipesModule: WellnessModule = {
  name: "healthy-recipes",
  kind: "app",
  appCode: "healthy-recipes",
  basePath: "/apps/healthy-recipes",
  router,
  description: "Healthy Recipes: recipe discovery, saved recipes, seven-day meal plans and shopping lists"
};
