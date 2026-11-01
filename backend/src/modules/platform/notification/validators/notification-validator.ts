import { body, param } from "express-validator";

export const registerDeviceValidation = [
  body("platform").isIn(["ios", "android", "web"]),
  body("pushToken").isString().isLength({ min: 10, max: 4096 })
];

/** True for an IANA zone name the runtime knows (e.g. "Asia/Seoul"); the scheduler evaluates reminders in it. */
function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const idValidation = [param("id").isUUID()];

const reminderFields = (partial: boolean) => [
  (partial ? body("title").optional() : body("title")).isString().trim().isLength({ min: 1, max: 120 }),
  (partial ? body("timeOfDay").optional() : body("timeOfDay")).matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body("body").optional({ values: "null" }).isString().isLength({ max: 500 }),
  body("daysOfWeek").optional().isArray({ min: 1, max: 7 }),
  body("daysOfWeek.*").isInt({ min: 0, max: 6 }),
  body("timezone").optional().isString().isLength({ max: 64 }).custom(isTimeZone).withMessage("must be an IANA time zone"),
  body("deepLink").optional({ values: "null" }).isString().isLength({ max: 500 }),
  body("isActive").optional().isBoolean({ strict: true })
];

export const createReminderValidation = reminderFields(false);
export const updateReminderValidation = [param("id").isUUID(), ...reminderFields(true)];
