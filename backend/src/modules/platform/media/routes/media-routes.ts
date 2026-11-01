import express, { Router } from "express";
import { body } from "express-validator";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { MediaController } from "../controllers/media-controller.js";
import { IMAGE_MIME_TYPES } from "../models/media.js";
import { LocalDiskStorage } from "../providers/local-disk-storage.js";
import { MediaService } from "../services/media-service.js";

const controller = new MediaController(new MediaService(new LocalDiskStorage()));

export const IMAGE_UPLOAD_PATH = "/images";

const uploadImageValidation = [
  body("mimeType").isIn(Object.keys(IMAGE_MIME_TYPES)),
  body("data").isBase64(),
  body("fileName").optional().isString().isLength({ max: 200 }),
  body("folder").optional().matches(/^[a-z0-9-]+(\/[a-z0-9-]+)?$/)
];

export const mediaRouter = Router();

/**
 * @openapi
 * /media/images:
 *   post:
 *     tags: [Media]
 *     summary: "Editor: upload an image (base64 JSON, max 8MB); returns its public URL under /static"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mimeType, data]
 *             properties:
 *               mimeType: { type: string, enum: [image/jpeg, image/png, image/webp, image/gif] }
 *               data: { type: string, description: Base64 file content }
 *               fileName: { type: string }
 *               folder: { type: string, example: foodvisor/foods }
 *     responses: { 201: { description: "{ imageUrl, imageStatus, bytes, mimeType }" } }
 */
mediaRouter.post(
  IMAGE_UPLOAD_PATH,
  // This route receives base64 images, so it has its own body limit (the global JSON parser skips it).
  express.json({ limit: "12mb" }),
  authenticate,
  requireRole("editor", "admin"),
  validate(uploadImageValidation),
  controller.uploadImage
);
