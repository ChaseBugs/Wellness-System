import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { MilestoneDomain, RecordMilestoneInput } from "../models/milestone.js";
import type { MilestoneService } from "../services/milestone-service.js";

export class MilestoneController extends BaseController {
  constructor(private milestoneService: MilestoneService) {
    super();
  }

  listDefinitions = this.handle(async (req, res) => {
    const month = this.query(req, "month");
    sendSuccess(
      res,
      await this.milestoneService.listDefinitions({
        month: month ? Number(month) : undefined,
        domain: this.query(req, "type") as MilestoneDomain | undefined
      })
    );
  });

  definitionsByMonth = this.handle(async (req, res) => {
    sendSuccess(res, await this.milestoneService.definitionsByMonth(Number(this.param(req, "month"))));
  });

  reviewDefinition = this.handle(async (req, res) => {
    sendSuccess(res, await this.milestoneService.reviewDefinition(this.param(req, "id"), req.body.approve === true));
  });

  listForChild = this.handle(async (req, res) => {
    const month = this.query(req, "month");
    sendSuccess(res, await this.milestoneService.listForChild(this.userId(req), this.param(req, "childId"), month ? Number(month) : undefined));
  });

  report = this.handle(async (req, res) => {
    const month = this.query(req, "month");
    sendSuccess(res, await this.milestoneService.report(this.userId(req), this.param(req, "childId"), month ? Number(month) : undefined));
  });

  record = this.handle(async (req, res) => {
    const body = req.body as RecordMilestoneInput;
    const record = await this.milestoneService.record(this.userId(req), this.param(req, "childId"), this.param(req, "milestoneId"), {
      status: body.status,
      achievedOn: body.achievedOn,
      notes: body.notes
    });
    sendSuccess(res, record);
  });

  unrecord = this.handle(async (req, res) => {
    await this.milestoneService.unrecord(this.userId(req), this.param(req, "childId"), this.param(req, "milestoneId"));
    res.status(204).end();
  });
}
