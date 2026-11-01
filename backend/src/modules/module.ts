import type { Router } from "express";
import type { AppCode } from "../config/app-catalog.js";

/**
 * Every module (shared platform capability or app) exposes one router mounted under the API prefix.
 * Platform modules never import app modules; app modules may use platform services, but never
 * another app's repositories. Cross-app data flows only through consent-checked platform ports.
 */
export interface WellnessModule {
  name: string;
  kind: "platform" | "app";
  basePath: string;
  router: Router;
  appCode?: AppCode;
  description: string;
}
