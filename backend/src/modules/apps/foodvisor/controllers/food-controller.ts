import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { FoodService } from "../services/food-service.js";

export class FoodController extends BaseController {
  constructor(private foodService: FoodService) {
    super();
  }

  search = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.foodService.search({
        ...toPageQuery(req.query.page, req.query.limit),
        q: this.query(req, "q"),
        category: this.query(req, "category")
      })
    );
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.foodService.get(this.param(req, "id")));
  });

  findByBarcode = this.handle(async (req, res) => {
    sendSuccess(res, await this.foodService.findByBarcode(this.param(req, "barcode")));
  });
}
