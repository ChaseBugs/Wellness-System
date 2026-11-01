import type { WellnessModule } from "../../module.js";
import { contentItemRouter } from "./routes/content-item-routes.js";

export const contentModule: WellnessModule = {
  name: "content",
  kind: "platform",
  basePath: "/content",
  router: contentItemRouter,
  description: "Content Factory: one reviewed CMS for recipes, exercise guides, articles, tutorials and audio"
};
