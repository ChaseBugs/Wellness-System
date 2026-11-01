import { body } from "express-validator";

export const trackEventsValidation = [
  body("events").isArray({ min: 1, max: 100 }),
  // snake_case event names keep dashboards and recommendation triggers consistent across apps.
  body("events.*.name").isString().matches(/^[a-z][a-z0-9_]{1,63}$/),
  body("events.*.properties").optional().isObject(),
  body("events.*.occurredAt").optional().isISO8601(),
  body("events.*.sessionId").optional().isString().isLength({ max: 100 }),
  body("events.*.anonymousId").optional().isString().isLength({ min: 8, max: 100 }),
  body("events.*.platform").optional().isIn(["ios", "android", "web"]),
  body("events.*.appVersion").optional().isString().isLength({ max: 40 })
];
