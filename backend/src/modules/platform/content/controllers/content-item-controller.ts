import type { Request } from "express";
import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type {
  ContentQuery,
  ContentType,
  CreateContentItemInput,
  Difficulty,
  ReviewStatus,
  UpdateContentItemInput
} from "../models/content-item.js";
import type { ContentItemService } from "../services/content-item-service.js";

const EDITABLE_FIELDS = [
  "title",
  "summary",
  "body",
  "appCodes",
  "category",
  "tags",
  "durationMinutes",
  "difficulty",
  "steps",
  "media",
  "attributes",
  "locale",
  "isPremium"
] as const;

function pickEditable(body: Record<string, unknown>): UpdateContentItemInput {
  const picked: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) if (body[field] !== undefined) picked[field] = body[field];
  return picked as UpdateContentItemInput;
}

export class ContentItemController extends BaseController {
  constructor(private contentItemService: ContentItemService) {
    super();
  }

  listPublished = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.listPublished(this.readQuery(req)));
  });

  getPublished = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.getPublished(this.param(req, "id"), req.user?.id));
  });

  listForEditor = this.handle(async (req, res) => {
    const status = this.query(req, "status") as ReviewStatus | undefined;
    sendSuccess(res, await this.contentItemService.listForEditor({ ...this.readQuery(req), statuses: status ? [status] : undefined }));
  });

  getForEditor = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.getForEditor(this.param(req, "id")));
  });

  create = this.handle(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const input = { ...pickEditable(body), contentType: body.contentType } as CreateContentItemInput;
    sendSuccess(res, await this.contentItemService.create(this.userId(req), input), 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.update(this.param(req, "id"), pickEditable(req.body)));
  });

  submit = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.submit(this.param(req, "id")));
  });

  review = this.handle(async (req, res) => {
    const decision = { approve: req.body.approve === true, notes: req.body.notes as string | undefined };
    sendSuccess(res, await this.contentItemService.review(this.param(req, "id"), this.userId(req), decision));
  });

  publish = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.publish(this.param(req, "id")));
  });

  archive = this.handle(async (req, res) => {
    sendSuccess(res, await this.contentItemService.archive(this.param(req, "id")));
  });

  private readQuery(req: Request): Omit<ContentQuery, "statuses"> {
    const maxMinutes = this.query(req, "maxMinutes");
    const excludeAllergens = this.query(req, "excludeAllergens");
    return {
      ...toPageQuery(req.query.page, req.query.limit),
      appCode: this.query(req, "app") as AppCode | undefined,
      contentType: this.query(req, "type") as ContentType | undefined,
      category: this.query(req, "category"),
      tag: this.query(req, "tag"),
      q: this.query(req, "q"),
      difficulty: this.query(req, "difficulty") as Difficulty | undefined,
      maxMinutes: maxMinutes ? Number(maxMinutes) : undefined,
      excludeAllergens: excludeAllergens ? excludeAllergens.split(",").map((value) => value.trim()).filter(Boolean) : undefined
    };
  }
}
