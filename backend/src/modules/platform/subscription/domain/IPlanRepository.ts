import type { AppCode } from "../../../../config/app-catalog.js";
import type { Plan, Store } from "../models/plan.js";

export interface IPlanRepository {
  /** Active plans; with `appCode`, only plans that unlock that app (its App Pro plus Wellness Pass). */
  listActive(appCode?: AppCode): Promise<Plan[]>;
  findByCode(code: string): Promise<Plan | null>;
  findByStoreProduct(store: Store, productId: string): Promise<Plan | null>;
}
