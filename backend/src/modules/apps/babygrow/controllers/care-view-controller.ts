import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { DiaperInput, FeedingInput, SleepInput } from "../models/care-view.js";
import type { CareViewService } from "../services/care-view-service.js";

export class CareViewController extends BaseController {
  constructor(private careViewService: CareViewService) {
    super();
  }

  feedings = this.handle(async (req, res) => {
    sendSuccess(res, await this.careViewService.feedings(this.userId(req), this.param(req, "childId"), this.query(req, "from"), this.query(req, "to")));
  });

  addFeeding = this.handle(async (req, res) => {
    const body = req.body as FeedingInput;
    const feeding = await this.careViewService.addFeeding(this.userId(req), this.param(req, "childId"), {
      feedingType: body.feedingType,
      startTime: body.startTime,
      endTime: body.endTime,
      amountMl: body.amountMl,
      side: body.side,
      notes: body.notes
    });
    sendSuccess(res, feeding, 201);
  });

  sleeps = this.handle(async (req, res) => {
    sendSuccess(res, await this.careViewService.sleeps(this.userId(req), this.param(req, "childId"), this.query(req, "from"), this.query(req, "to")));
  });

  addSleep = this.handle(async (req, res) => {
    const body = req.body as SleepInput;
    const sleep = await this.careViewService.addSleep(this.userId(req), this.param(req, "childId"), {
      sleepType: body.sleepType,
      startTime: body.startTime,
      endTime: body.endTime,
      qualityRating: body.qualityRating,
      notes: body.notes
    });
    sendSuccess(res, sleep, 201);
  });

  diapers = this.handle(async (req, res) => {
    sendSuccess(res, await this.careViewService.diapers(this.userId(req), this.param(req, "childId"), this.query(req, "from"), this.query(req, "to")));
  });

  addDiaper = this.handle(async (req, res) => {
    const body = req.body as DiaperInput;
    const diaper = await this.careViewService.addDiaper(this.userId(req), this.param(req, "childId"), {
      diaperType: body.diaperType,
      changeTime: body.changeTime,
      notes: body.notes
    });
    sendSuccess(res, diaper, 201);
  });
}
