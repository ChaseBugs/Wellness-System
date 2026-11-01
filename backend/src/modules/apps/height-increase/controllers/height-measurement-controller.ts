import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { UpsertHeightMeasurementInput } from "../models/height-measurement.js";
import type { HeightMeasurementService } from "../services/height-measurement-service.js";

export class HeightMeasurementController extends BaseController {
  constructor(private heightMeasurementService: HeightMeasurementService) {
    super();
  }

  trend = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightMeasurementService.trend(this.userId(req)));
  });

  record = this.handle(async (req, res) => {
    const body = req.body as UpsertHeightMeasurementInput;
    const measurement = await this.heightMeasurementService.record(this.userId(req), {
      measuredOn: body.measuredOn,
      heightCm: body.heightCm,
      weightKg: body.weightKg,
      notes: body.notes
    });
    sendSuccess(res, measurement, 201);
  });

  delete = this.handle(async (req, res) => {
    await this.heightMeasurementService.delete(this.userId(req), this.param(req, "id"));
    res.status(204).end();
  });
}
