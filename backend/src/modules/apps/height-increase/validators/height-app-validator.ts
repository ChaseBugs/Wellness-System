import { body, param, query } from "express-validator";
import { GOAL_STATUSES, GOAL_TYPES, MOODS } from "../models/daily-log.js";
import { GENDERS, UNITS } from "../models/height-profile.js";

const isoDate = (chain: ReturnType<typeof body>) => chain.isISO8601({ strict: true }).isLength({ min: 10, max: 10 });

export const updateProfileValidation = [
  body("name").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("targetHeightCm").optional({ values: "null" }).isFloat({ min: 40, max: 260 }),
  isoDate(body("birthDate").optional({ values: "null" })),
  body("gender").optional({ values: "null" }).isIn(GENDERS),
  body("units").optional().isIn(UNITS),
  body("notificationsEnabled").optional().isBoolean({ strict: true }),
  body("avatarUrl").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const reportValidation = [
  query("limit").optional().isInt({ min: 1, max: 366 }),
  // The client's local date, for the workout streak.
  query("today").optional().isISO8601({ strict: true }).isLength({ min: 10, max: 10 })
];

export const recordLogValidation = [
  isoDate(body("date")),
  body("heightCm").optional({ values: "null" }).isFloat({ min: 40, max: 250 }),
  body("weightKg").optional({ values: "null" }).isFloat({ min: 2, max: 300 }),
  body("sleepHours").optional({ values: "null" }).isFloat({ min: 0, max: 24 }),
  body("waterGlasses").optional({ values: "null" }).isInt({ min: 0, max: 50 }),
  body("mood").optional({ values: "null" }).isIn(MOODS),
  body("workoutMinutes").optional().isInt({ min: 0, max: 1440 }),
  body("completedExercises").optional().isArray({ max: 100 }),
  body("completedExercises.*.exerciseId").optional().isUUID(),
  body("completedExercises.*.title").optional().isString().isLength({ max: 200 }),
  body("completedExercises.*.durationSeconds").optional().isInt({ min: 0, max: 86_400 }),
  body("completedExercises.*.calories").optional().isFloat({ min: 0, max: 10_000 }),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

const goalFields = (partial: boolean) => [
  (partial ? body("title").optional() : body("title")).isString().trim().isLength({ min: 1, max: 120 }),
  body("type").optional().isIn(GOAL_TYPES),
  body("targetValue").optional({ values: "null" }).isFloat(),
  body("currentValue").optional().isFloat(),
  body("unit").optional({ values: "null" }).isString().isLength({ max: 20 }),
  body("startsAt").optional({ values: "null" }).isISO8601(),
  body("dueAt").optional({ values: "null" }).isISO8601()
];

export const listGoalsValidation = [query("status").optional().isIn(GOAL_STATUSES)];
export const createGoalValidation = goalFields(false);
export const updateGoalValidation = [param("id").isUUID(), ...goalFields(true), body("status").optional().isIn(GOAL_STATUSES)];

export const listExercisesValidation = [
  query("category").optional().isString().isLength({ max: 40 }),
  query("level").optional().isIn(["beginner", "intermediate", "advanced"])
];
export const listPlansValidation = [
  query("type").optional().isIn(["featured", "daily", "weekly", "custom-template"]),
  query("level").optional().isIn(["beginner", "intermediate", "advanced"])
];
export const listArticlesValidation = [query("category").optional().isString().isLength({ max: 40 })];
export const listBannersValidation = [query("placement").optional().isIn(["home-top", "home-card", "reports-top", "modal", "discover"])];
