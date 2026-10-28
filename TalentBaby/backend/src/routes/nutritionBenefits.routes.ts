import { Router } from 'express';
import { NutritionBenefitsController } from '../controllers/nutritionBenefits.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new NutritionBenefitsController();

// GET  /api/v1/nutrition/categories                        — list all nutrient categories
// GET  /api/v1/nutrition/categories/with-foods             ?age_group=12-17 &vegetarian=true
// GET  /api/v1/nutrition/categories/:id/foods              ?age_group= &vegetarian=
// GET  /api/v1/nutrition/foods/:id                         — single food item detail
// GET  /api/v1/nutrition/baby/:babyId                      ?vegetarian=   (auto age group from baby)
// GET  /api/v1/nutrition/search?q=spinach                  &age_group= &vegetarian=

router.get('/categories/with-foods',      authenticate, c.getCategoriesWithFoods.bind(c));
router.get('/categories/:id/foods',       authenticate, c.getCategoryFoods.bind(c));
router.get('/categories',                 authenticate, c.getCategories.bind(c));
router.get('/foods/:id',                  authenticate, c.getFoodById.bind(c));
router.get('/baby/:babyId',               authenticate, c.getFoodsForBaby.bind(c));
router.get('/search',                     authenticate, c.searchFoods.bind(c));

// ─── Admin CRUD ───────────────────────────────────────────────────────────────
// POST   /api/v1/nutrition/foods
// PUT    /api/v1/nutrition/foods/:id
// DELETE /api/v1/nutrition/foods/:id

router.post('/foods',        authenticate, c.createFood.bind(c));
router.put('/foods/:id',     authenticate, c.updateFood.bind(c));
router.delete('/foods/:id',  authenticate, c.deleteFood.bind(c));

export default router;
