import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { SavedRecipeService } from "../services/saved-recipe-service.js";

export class SavedRecipeController extends BaseController {
  constructor(private savedRecipeService: SavedRecipeService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.savedRecipeService.list(this.userId(req)));
  });

  save = this.handle(async (req, res) => {
    await this.savedRecipeService.save(this.userId(req), this.param(req, "contentId"));
    res.status(204).end();
  });

  remove = this.handle(async (req, res) => {
    await this.savedRecipeService.remove(this.userId(req), this.param(req, "contentId"));
    res.status(204).end();
  });
}
