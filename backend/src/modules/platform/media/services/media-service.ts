import { randomUUID } from "crypto";
import path from "path";
import { ValidationError } from "../../../../utils/errors.js";
import logger, { EMOJIS } from "../../../../utils/logger.js";
import type { IMediaStorage } from "../domain/IMediaStorage.js";
import { IMAGE_MIME_TYPES, type UploadImageInput, type UploadedImageResponse } from "../models/media.js";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Magic numbers guard against a mislabelled payload being served as an image.
const SIGNATURES: Record<string, (buffer: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/gif": (b) => b.subarray(0, 4).toString("ascii") === "GIF8",
  "image/webp": (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP"
};

function safeSegment(value: string, fallback: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || fallback
  );
}

export class MediaService {
  constructor(private storage: IMediaStorage) {}

  async uploadImage(userId: string, input: UploadImageInput): Promise<UploadedImageResponse> {
    const extension = IMAGE_MIME_TYPES[input.mimeType];
    if (!extension) throw new ValidationError("Only jpg, png, webp and gif images are supported");

    const content = Buffer.from(input.data, "base64");
    if (content.byteLength === 0) throw new ValidationError("Image data is empty");
    if (content.byteLength > MAX_IMAGE_BYTES) throw new ValidationError("Image must be smaller than 8MB");
    if (!SIGNATURES[input.mimeType](content)) throw new ValidationError(`File content is not a valid ${input.mimeType} image`);

    // Folders are a fixed two-level "<app>/<area>" slug so uploads can never escape public/static/uploads.
    const folderParts = (input.folder ?? "shared/images").split("/").slice(0, 2).map((part) => safeSegment(part, "shared"));
    const folder = ["uploads", ...folderParts, new Date().toISOString().slice(0, 7)].join("/");
    const fileName = `${safeSegment(path.parse(input.fileName ?? "image").name, "image")}-${randomUUID()}${extension}`;

    const imageUrl = await this.storage.save(folder, fileName, content);
    logger.infoWithEmoji(EMOJIS.CREATE, "Image uploaded", "MEDIA", { userId, bytes: content.byteLength, folder });
    return { imageUrl, imageStatus: "uploaded", bytes: content.byteLength, mimeType: input.mimeType };
  }
}
