import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { Store } from "../models/plan.js";
import type { VerifyPurchaseInput } from "../models/purchase.js";
import type { PurchaseService } from "../services/purchase-service.js";

function toVerifyInput(raw: VerifyPurchaseInput): VerifyPurchaseInput {
  return { store: raw.store, productId: raw.productId, purchaseToken: raw.purchaseToken };
}

export class PurchaseController extends BaseController {
  constructor(private purchaseService: PurchaseService) {
    super();
  }

  verify = this.handle(async (req, res) => {
    const result = await this.purchaseService.verify(this.userId(req), toVerifyInput(req.body as VerifyPurchaseInput), req.appCode);
    sendSuccess(res, result, 201);
  });

  restore = this.handle(async (req, res) => {
    const purchases = (req.body.purchases as VerifyPurchaseInput[]).map(toVerifyInput);
    sendSuccess(res, await this.purchaseService.restore(this.userId(req), purchases, req.appCode));
  });

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.purchaseService.listForUser(this.userId(req)));
  });

  webhook = this.handle(async (req, res) => {
    sendSuccess(res, await this.purchaseService.handleNotification(this.param(req, "store") as Store, req.body, req.headers));
  });
}
