import type { WellnessModule } from "../../module.js";
import { mediaRouter } from "./routes/media-routes.js";

export const mediaModule: WellnessModule = {
  name: "media",
  kind: "platform",
  basePath: "/media",
  router: mediaRouter,
  description: "Image uploads for the admin, served from /static (local disk; swappable for object storage)"
};
