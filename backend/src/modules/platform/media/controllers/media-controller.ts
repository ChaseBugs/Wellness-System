import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { UploadImageInput } from "../models/media.js";
import type { MediaService } from "../services/media-service.js";

export class MediaController extends BaseController {
  constructor(private mediaService: MediaService) {
    super();
  }

  uploadImage = this.handle(async (req, res) => {
    const body = req.body as UploadImageInput;
    const uploaded = await this.mediaService.uploadImage(this.userId(req), {
      fileName: body.fileName,
      mimeType: body.mimeType,
      data: body.data,
      folder: body.folder
    });
    sendSuccess(res, uploaded, 201);
  });
}
