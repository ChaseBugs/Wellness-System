import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { HeightCatalogService } from "../services/height-catalog-service.js";

export class HeightCatalogController extends BaseController {
  constructor(private heightCatalogService: HeightCatalogService) {
    super();
  }

  home = this.handle(async (_req, res) => {
    sendSuccess(res, await this.heightCatalogService.home());
  });

  exercises = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightCatalogService.exercises({ category: this.query(req, "category"), level: this.query(req, "level") }));
  });

  trainingPlans = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightCatalogService.trainingPlans({ type: this.query(req, "type"), level: this.query(req, "level") }));
  });

  articles = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightCatalogService.articlesList(this.query(req, "category")));
  });

  banners = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightCatalogService.banners(this.query(req, "placement")));
  });
}
