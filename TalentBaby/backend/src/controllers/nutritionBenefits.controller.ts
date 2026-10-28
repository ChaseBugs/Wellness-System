import { BaseController } from './base.controller';
import { NutritionBenefitsService } from '../services/nutritionBenefits.service';

const svc = new NutritionBenefitsService();

export class NutritionBenefitsController extends BaseController {

  // GET /nutrition/categories?lang=ko  (optional — omit to get all)
  getCategories = this.handle(async (req, res) => {
    const lang = req.query.lang as string | undefined;
    this.ok(res, await svc.getCategories(lang));
  });

  // GET /nutrition/categories/with-foods   ?age_group=12-17 &vegetarian=true &lang=ko
  getCategoriesWithFoods = this.handle(async (req, res) => {
    const ageGroup = req.query.age_group as string | undefined;
    const vegOnly  = req.query.vegetarian === 'true';
    const lang     = req.query.lang as string | undefined;
    this.ok(res, await svc.getCategoriesWithFoods(ageGroup, vegOnly, lang));
  });

  // GET /nutrition/categories/:id/foods    ?age_group= &vegetarian= &lang=ko
  getCategoryFoods = this.handle(async (req, res) => {
    const ageGroup = req.query.age_group as string | undefined;
    const vegOnly  = req.query.vegetarian === 'true';
    const lang     = req.query.lang as string | undefined;
    this.ok(res, await svc.getCategoryFoods(this.intParam(req, 'id'), ageGroup, vegOnly, lang));
  });

  // GET /nutrition/foods/:id
  getFoodById = this.handle(async (req, res) => {
    this.ok(res, await svc.getFoodById(this.intParam(req, 'id')));
  });

  // GET /nutrition/baby/:babyId            ?vegetarian=true
  getFoodsForBaby = this.handle(async (req, res) => {
    const vegOnly = req.query.vegetarian === 'true';
    this.ok(res, await svc.getFoodsForBaby(this.intParam(req, 'babyId'), this.userId(req), vegOnly));
  });

  // GET /nutrition/search?q=spinach        &age_group= &vegetarian=
  searchFoods = this.handle(async (req, res) => {
    const q        = req.query.q as string;
    const ageGroup = req.query.age_group as string | undefined;
    const vegOnly  = req.query.vegetarian === 'true';
    this.ok(res, await svc.searchFoods(q, ageGroup, vegOnly));
  });

  // POST   /nutrition/foods
  createFood = this.handle(async (req, res) => {
    this.created(res, await svc.createFood(req.body));
  });

  // PUT    /nutrition/foods/:id
  updateFood = this.handle(async (req, res) => {
    this.ok(res, await svc.updateFood(this.intParam(req, 'id'), req.body));
  });

  // DELETE /nutrition/foods/:id
  deleteFood = this.handle(async (req, res) => {
    await svc.deleteFood(this.intParam(req, 'id'));
    this.ok(res, { message: 'Food deleted.' });
  });
}
