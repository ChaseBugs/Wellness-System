import type { IncomingHttpHeaders } from "http";
import type { Plan, Store } from "../models/plan.js";
import type { StoreNotification, StoreVerification, VerifyPurchaseInput } from "../models/purchase.js";

/** Port to a store's server API. Purchases are trusted only after the store confirms them server-side. */
export interface IStoreVerifier {
  readonly store: Store;
  verify(input: VerifyPurchaseInput, plan: Plan): Promise<StoreVerification>;
  parseNotification(body: unknown, headers: IncomingHttpHeaders): Promise<StoreNotification>;
}
