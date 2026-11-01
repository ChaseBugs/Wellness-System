import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateConsentInput } from "../models/consent.js";
import type { ConsentService } from "../services/consent-service.js";

export class ConsentController extends BaseController {
  constructor(private consentService: ConsentService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.consentService.list(this.userId(req)));
  });

  grant = this.handle(async (req, res) => {
    const body = req.body as CreateConsentInput;
    const consent = await this.consentService.grant(this.userId(req), {
      sourceApp: body.sourceApp,
      targetApp: body.targetApp,
      scope: body.scope
    });
    sendSuccess(res, consent, 201);
  });

  revoke = this.handle(async (req, res) => {
    await this.consentService.revoke(this.userId(req), this.param(req, "id"));
    res.status(204).end();
  });
}
