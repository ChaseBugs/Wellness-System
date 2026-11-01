import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { AddCaregiverInput, CreateChildInput, UpdateChildInput } from "../models/child.js";
import type { ChildService } from "../services/child-service.js";

function pickChild(body: Record<string, unknown>): UpdateChildInput {
  const picked: UpdateChildInput = {};
  if (body.name !== undefined) picked.name = body.name as string;
  if (body.birthDate !== undefined) picked.birthDate = body.birthDate as string;
  if (body.sex !== undefined) picked.sex = body.sex as UpdateChildInput["sex"];
  return picked;
}

export class ChildController extends BaseController {
  constructor(private childService: ChildService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.list(this.userId(req)));
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.get(this.userId(req), this.param(req, "childId")));
  });

  create = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.create(this.userId(req), pickChild(req.body) as CreateChildInput), 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.update(this.userId(req), this.param(req, "childId"), pickChild(req.body)));
  });

  delete = this.handle(async (req, res) => {
    await this.childService.delete(this.userId(req), this.param(req, "childId"));
    res.status(204).end();
  });

  listCaregivers = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.listCaregivers(this.userId(req), this.param(req, "childId")));
  });

  addCaregiver = this.handle(async (req, res) => {
    const input: AddCaregiverInput = { email: req.body.email, role: req.body.role };
    sendSuccess(res, await this.childService.addCaregiver(this.userId(req), this.param(req, "childId"), input), 201);
  });

  removeCaregiver = this.handle(async (req, res) => {
    await this.childService.removeCaregiver(this.userId(req), this.param(req, "childId"), this.param(req, "userId"));
    res.status(204).end();
  });
}
