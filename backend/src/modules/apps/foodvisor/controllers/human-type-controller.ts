import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { ClassifySurveyInput } from "../models/human-type.js";
import type { HumanTypeService } from "../services/human-type-service.js";

export class HumanTypeController extends BaseController {
  constructor(private humanTypeService: HumanTypeService) {
    super();
  }

  questions = this.handle(async (_req, res) => {
    sendSuccess(res, await this.humanTypeService.questions());
  });

  classify = this.handle(async (req, res) => {
    const body = req.body as ClassifySurveyInput;
    const answers = body.answers.map((answer) => ({ questionId: answer.questionId, value: answer.value, labelKo: answer.labelKo }));
    sendSuccess(res, await this.humanTypeService.classify(this.userId(req), { answers, notes: body.notes }), 201);
  });

  mySurveys = this.handle(async (req, res) => {
    sendSuccess(res, await this.humanTypeService.mySurveys(this.userId(req)));
  });

  reclassify = this.handle(async (req, res) => {
    sendSuccess(res, await this.humanTypeService.reclassify(this.param(req, "id")));
  });
}
