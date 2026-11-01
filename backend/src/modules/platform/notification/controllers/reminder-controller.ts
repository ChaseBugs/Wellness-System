import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateReminderInput, UpdateReminderInput } from "../models/reminder.js";
import type { ReminderService } from "../services/reminder-service.js";

const FIELDS = ["title", "body", "timeOfDay", "daysOfWeek", "timezone", "deepLink", "isActive"] as const;

function pick(body: Record<string, unknown>): UpdateReminderInput {
  const picked: Record<string, unknown> = {};
  for (const field of FIELDS) if (body[field] !== undefined) picked[field] = body[field];
  return picked as UpdateReminderInput;
}

export class ReminderController extends BaseController {
  constructor(private reminderService: ReminderService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.reminderService.list(this.userId(req), this.appCode(req)));
  });

  create = this.handle(async (req, res) => {
    const reminder = await this.reminderService.create(this.userId(req), this.appCode(req), pick(req.body) as CreateReminderInput);
    sendSuccess(res, reminder, 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.reminderService.update(this.userId(req), this.appCode(req), this.param(req, "id"), pick(req.body)));
  });

  delete = this.handle(async (req, res) => {
    await this.reminderService.delete(this.userId(req), this.appCode(req), this.param(req, "id"));
    res.status(204).end();
  });
}
