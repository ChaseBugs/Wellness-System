export const IMAGE_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
} as const;

export type ImageMimeType = keyof typeof IMAGE_MIME_TYPES;

/** Same JSON contract the legacy Foodvisor admin used for `/foods/image-upload`. */
export interface UploadImageInput {
  fileName?: string;
  mimeType: ImageMimeType;
  /** Base64-encoded file content (no data: prefix). */
  data: string;
  /** Logical folder, e.g. "foodvisor/foods" or "babygrow/activities". */
  folder?: string;
}

export interface UploadedImageResponse {
  imageUrl: string;
  imageStatus: "uploaded";
  bytes: number;
  mimeType: ImageMimeType;
}
