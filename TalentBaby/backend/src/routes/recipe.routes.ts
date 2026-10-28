import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new RecipeController();

// ─── General ────────────────────────────────────────────────────────────────
// GET  /api/v1/recipes              ?target=baby|mum &age_months= &category=
// GET  /api/v1/recipes/favorites
// GET  /api/v1/recipes/:id
// POST /api/v1/recipes/:id/favorite
// DELETE /api/v1/recipes/:id/favorite

router.get('/favorites',        authenticate, c.getFavorites.bind(c));
router.post('/:id/favorite',    authenticate, c.addToFavorites.bind(c));
router.delete('/:id/favorite',  authenticate, c.removeFromFavorites.bind(c));
router.get('/type/:type',       authenticate, c.getRecipesByType.bind(c));

// ─── Baby ────────────────────────────────────────────────────────────────────
// GET  /api/v1/recipes/baby/age-groups
// GET  /api/v1/recipes/baby/age-group/:group       ?meal_slot=breakfast|lunch|dinner|snack
// GET  /api/v1/recipes/baby/:babyId/recipes         ?meal_slot=
// GET  /api/v1/recipes/baby/:babyId/daily-plan      ?date=YYYY-MM-DD
// POST /api/v1/recipes/baby/:babyId/daily-plan/generate  { date? }
// PUT  /api/v1/recipes/baby/:babyId/daily-plan/slot      { plan_date, meal_slot, recipe_id?, notes? }
// GET  /api/v1/recipes/baby/:babyId/daily-tip  (legacy)

router.get('/baby/age-groups',                   authenticate, c.getBabyAgeGroups.bind(c));
router.get('/baby/age-group/:group',             authenticate, c.getBabyRecipesByAgeGroup.bind(c));
router.get('/baby/:babyId/recipes',              authenticate, c.getBabyRecipesByBabyId.bind(c));
router.get('/baby/:babyId/daily-plan',           authenticate, c.getBabyDailyPlan.bind(c));
router.post('/baby/:babyId/daily-plan/generate', authenticate, c.generateBabyDailyPlan.bind(c));
router.put('/baby/:babyId/daily-plan/slot',      authenticate, c.setBabyPlanSlot.bind(c));
router.get('/baby/:babyId/daily-tip',            authenticate, c.getDailyRecipeTip.bind(c));
router.get('/baby/:babyId',                      authenticate, c.getRecipesByAge.bind(c));

// ─── Mum ─────────────────────────────────────────────────────────────────────
// GET  /api/v1/recipes/mum/meal-slots
// GET  /api/v1/recipes/mum                           (all mum recipes)
// GET  /api/v1/recipes/mum/slot/:slot                early_morning|breakfast|mid_morning|lunch|evening|dinner|bedtime
// GET  /api/v1/recipes/mum/daily-plan                ?date=YYYY-MM-DD
// POST /api/v1/recipes/mum/daily-plan/generate       { date? }
// PUT  /api/v1/recipes/mum/daily-plan/slot           { plan_date, meal_slot, recipe_id?, notes? }

router.get('/mum/meal-slots',            authenticate, c.getMumMealSlots.bind(c));
router.get('/mum/daily-plan',            authenticate, c.getMumDailyPlan.bind(c));
router.post('/mum/daily-plan/generate',  authenticate, c.generateMumDailyPlan.bind(c));
router.put('/mum/daily-plan/slot',       authenticate, c.setMumPlanSlot.bind(c));
router.get('/mum/slot/:slot',            authenticate, c.getMumRecipes.bind(c));
router.get('/mum',                       authenticate, c.getMumRecipes.bind(c));

// ─── General (last — avoid shadowing named routes) ───────────────────────────
router.get('/',    authenticate, c.getRecipes.bind(c));
router.get('/:id', authenticate, c.getRecipe.bind(c));

// ─── Admin CRUD ───────────────────────────────────────────────────────────────
// POST   /api/v1/recipes
// PUT    /api/v1/recipes/:id
// DELETE /api/v1/recipes/:id

router.post('/',    authenticate, c.createRecipe.bind(c));
router.put('/:id',  authenticate, c.updateRecipe.bind(c));
router.delete('/:id', authenticate, c.deleteRecipe.bind(c));

export default router;
