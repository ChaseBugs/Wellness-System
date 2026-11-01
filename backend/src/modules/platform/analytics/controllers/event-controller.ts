import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { TrackEventInput } from "../models/event.js";
import type { EventService } from "../services/event-service.js";

export class EventController extends BaseController {
  constructor(private eventService: EventService) {
    super();
  }

  track = this.handle(async (req, res) => {
    const events = (req.body.events as TrackEventInput[]).map((event) => ({
      name: event.name,
      properties: event.properties,
      occurredAt: event.occurredAt,
      sessionId: event.sessionId,
      anonymousId: event.anonymousId,
      platform: event.platform,
      appVersion: event.appVersion
    }));
    sendSuccess(res, await this.eventService.track(this.appCode(req), req.user?.id, events), 202);
  });
}
