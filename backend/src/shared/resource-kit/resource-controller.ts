import type { Request } from "express";
import { BaseController } from "../../utils/base-controller.js";
import { sendSuccess } from "../../utils/response.js";
import type { ResourceDefinition } from "./resource-definition.js";
import type { ResourceActor, ResourceService } from "./resource-service.js";

export class ResourceController extends BaseController {
  constructor(
    private definition: ResourceDefinition,
    private resourceService: ResourceService
  ) {
    super();
  }

  list = this.handle(async (req, res) => {
    const query = this.resourceService.parseListQuery(this.definition, req.query as Record<string, unknown>);
    sendSuccess(res, await this.resourceService.list(this.definition, query));
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.resourceService.get(this.definition, this.param(req, "id")));
  });

  create = this.handle(async (req, res) => {
    sendSuccess(res, await this.resourceService.create(this.definition, req.body, this.actor(req)), 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.resourceService.update(this.definition, this.param(req, "id"), req.body, this.actor(req)));
  });

  delete = this.handle(async (req, res) => {
    await this.resourceService.delete(this.definition, this.param(req, "id"), this.actor(req));
    res.status(204).end();
  });

  bulkVerify = this.handle(async (req, res) => {
    const body = (req.body ?? {}) as { ids?: unknown; doctorVerified?: unknown };
    sendSuccess(res, await this.resourceService.bulkVerify(this.definition, body.ids, body.doctorVerified, this.actor(req)));
  });

  bulkDelete = this.handle(async (req, res) => {
    sendSuccess(res, await this.resourceService.bulkDelete(this.definition, (req.body ?? {}).ids, this.actor(req)));
  });

  private actor(req: Request): ResourceActor {
    return { id: this.userId(req), role: req.user!.role, requestId: req.id };
  }
}
