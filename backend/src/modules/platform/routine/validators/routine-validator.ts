import { body, param, query } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";
import { DIFFICULTIES } from "../../content/models/content-item.js";

const PUBLISH_STATUSES = ["draft", "published", "archived"];

export const idValidation = [param("id").isUUID()];

export const expertReviewValidation = [
  param("id").isUUID(),
  body("approve").isBoolean({ strict: true }),
  body("notes").optional().isString().isLength({ max: 2000 })
];

export const listEditorValidation = [
  query("app").optional().isIn(APP_CODES),
  query("status").optional().isIn(PUBLISH_STATUSES),
  query("level").optional().isIn(DIFFICULTIES),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

const exerciseFields = (partial: boolean) => [
  (partial ? body("name").optional() : body("name")).isString().trim().isLength({ min: 1, max: 120 }),
  (partial ? body("appCodes").optional() : body("appCodes")).isArray({ min: 1, max: 25 }),
  body("appCodes.*").isIn(APP_CODES),
  body("description").optional({ values: "null" }).isString().isLength({ max: 4000 }),
  body("bodyAreas").optional().isArray({ max: 20 }),
  body("bodyAreas.*").isString().isLength({ min: 1, max: 40 }),
  body("difficulty").optional().isIn(DIFFICULTIES),
  body("defaultDurationSeconds").optional({ values: "null" }).isInt({ min: 1, max: 7200 }),
  body("defaultReps").optional({ values: "null" }).isInt({ min: 1, max: 500 }),
  body("media").optional().isObject(),
  body("safetyNotes").optional().isArray({ max: 20 }),
  body("safetyNotes.*").isString().isLength({ min: 1, max: 500 }),
  body("contraindications").optional().isArray({ max: 20 }),
  body("contraindications.*").isString().isLength({ min: 1, max: 500 })
];

export const createExerciseValidation = exerciseFields(false);
export const updateExerciseValidation = [param("id").isUUID(), ...exerciseFields(true)];

const routineFields = (partial: boolean) => [
  (partial ? body("title").optional() : body("title")).isString().trim().isLength({ min: 1, max: 160 }),
  body("description").optional({ values: "null" }).isString().isLength({ max: 4000 }),
  body("goal").optional({ values: "null" }).isString().isLength({ max: 80 }),
  body("level").optional().isIn(DIFFICULTIES),
  body("estimatedMinutes").optional({ values: "null" }).isInt({ min: 1, max: 600 }),
  body("tags").optional().isArray({ max: 30 }),
  body("tags.*").isString().isLength({ min: 1, max: 40 }),
  body("isPremium").optional().isBoolean({ strict: true }),
  (partial ? body("steps").optional() : body("steps")).isArray({ min: 1, max: 100 }),
  body("steps.*.exerciseId").isUUID(),
  body("steps.*.sets").optional().isInt({ min: 1, max: 50 }),
  body("steps.*.reps").optional().isInt({ min: 1, max: 500 }),
  body("steps.*.durationSeconds").optional().isInt({ min: 1, max: 7200 }),
  body("steps.*.restSeconds").optional().isInt({ min: 0, max: 1800 }),
  body("steps.*.notes").optional().isString().isLength({ max: 500 })
];

export const createRoutineValidation = [body("appCode").isIn(APP_CODES), ...routineFields(false)];
export const updateRoutineValidation = [param("id").isUUID(), ...routineFields(true)];

export const listRoutinesValidation = [
  query("level").optional().isIn(DIFFICULTIES),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

export const startSessionValidation = [body("routineId").isUUID()];

export const completeSessionValidation = [
  param("id").isUUID(),
  body("completedSteps").isInt({ min: 0, max: 1000 }),
  body("durationSeconds").isInt({ min: 0, max: 86400 }),
  body("perceivedEffort").optional().isInt({ min: 1, max: 10 }),
  body("notes").optional().isString().isLength({ max: 1000 })
];
