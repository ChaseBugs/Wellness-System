import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { UpdateParentProfileInput } from "../models/parent-profile.js";
import type { ChildService } from "../services/child-service.js";
import type { ParentProfileService } from "../services/parent-profile-service.js";

const PROFILE_FIELDS = ["fullName", "languagePreference", "phoneNumber", "gender", "birthdate", "profilePictureUrl", "relationToBaby"] as const;

/** The caregiver's profile and the child the app opens on. */
export class ProfileController extends BaseController {
  constructor(
    private parentProfileService: ParentProfileService,
    private childService: ChildService
  ) {
    super();
  }

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.parentProfileService.get(this.userId(req)));
  });

  update = this.handle(async (req, res) => {
    const input: Record<string, unknown> = {};
    for (const field of PROFILE_FIELDS) if (req.body[field] !== undefined) input[field] = req.body[field];
    sendSuccess(res, await this.parentProfileService.update(this.userId(req), input as UpdateParentProfileInput));
  });

  activeChild = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.getActive(this.userId(req)));
  });

  setActiveChild = this.handle(async (req, res) => {
    sendSuccess(res, await this.childService.setActive(this.userId(req), String(req.body.childId)));
  });
}
