import { body, param, query } from "express-validator";
import { CARE_LOG_TYPES } from "../models/care-log.js";
import { DIAPER_TYPES, FEEDING_TYPES, SLEEP_TYPES } from "../models/care-view.js";
import { DIFFICULTY_FEEDBACK } from "../models/library.js";
import { MILESTONE_DOMAINS, MILESTONE_STATUSES } from "../models/milestone.js";

const isoDate = (chain: ReturnType<typeof body>) => chain.isISO8601({ strict: true }).isLength({ min: 10, max: 10 });

export const childIdValidation = [param("childId").isUUID()];

export const createChildValidation = [
  body("name").isString().trim().isLength({ min: 1, max: 80 }),
  isoDate(body("birthDate")),
  body("sex").optional().isIn(["female", "male", "unspecified"]),
  body("birthWeightKg").optional({ values: "null" }).isFloat({ min: 0.3, max: 8 }),
  body("birthHeightCm").optional({ values: "null" }).isFloat({ min: 20, max: 70 }),
  body("avatarUrl").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const updateChildValidation = [
  param("childId").isUUID(),
  body("name").optional().isString().trim().isLength({ min: 1, max: 80 }),
  isoDate(body("birthDate").optional()),
  body("sex").optional().isIn(["female", "male", "unspecified"]),
  body("birthWeightKg").optional({ values: "null" }).isFloat({ min: 0.3, max: 8 }),
  body("birthHeightCm").optional({ values: "null" }).isFloat({ min: 20, max: 70 }),
  body("avatarUrl").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const addCaregiverValidation = [
  param("childId").isUUID(),
  body("email").isEmail(),
  body("role").isIn(["editor", "viewer"])
];

export const removeCaregiverValidation = [param("childId").isUUID(), param("userId").isUUID()];

const growthFields = (partial: boolean) => [
  isoDate(partial ? body("measuredOn").optional() : body("measuredOn")),
  body("heightCm").optional({ values: "null" }).isFloat({ min: 20, max: 200 }),
  body("weightKg").optional({ values: "null" }).isFloat({ min: 0.3, max: 150 }),
  body("headCircumferenceCm").optional({ values: "null" }).isFloat({ min: 15, max: 70 }),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const createGrowthRecordValidation = [param("childId").isUUID(), ...growthFields(false)];
export const updateGrowthRecordValidation = [param("childId").isUUID(), param("id").isUUID(), ...growthFields(true)];
export const growthRecordIdValidation = [param("childId").isUUID(), param("id").isUUID()];

export const createCareLogValidation = [
  param("childId").isUUID(),
  body("logType").isIn(CARE_LOG_TYPES),
  body("startedAt").isISO8601(),
  body("endedAt").optional({ values: "null" }).isISO8601(),
  body("details").optional().isObject(),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const updateCareLogValidation = [
  param("childId").isUUID(),
  param("id").isUUID(),
  body("startedAt").optional().isISO8601(),
  body("endedAt").optional({ values: "null" }).isISO8601(),
  body("details").optional().isObject(),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const careLogIdValidation = [param("childId").isUUID(), param("id").isUUID()];

export const listCareLogsValidation = [
  param("childId").isUUID(),
  query("type").optional().isIn(CARE_LOG_TYPES),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

export const careDaySummaryValidation = [
  param("childId").isUUID(),
  query("date").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  query("timezone").optional().isString().isLength({ max: 64 })
];

export const reviewMilestoneDefinitionValidation = [param("id").isUUID(), body("approve").isBoolean({ strict: true })];

export const recordMilestoneValidation = [
  param("childId").isUUID(),
  param("milestoneId").isUUID(),
  body("status").isIn(MILESTONE_STATUSES),
  isoDate(body("achievedOn").optional({ values: "null" })),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const listDefinitionsValidation = [query("month").optional().isInt({ min: 1, max: 72 }), query("type").optional().isIn(MILESTONE_DOMAINS)];
export const monthParamValidation = [param("month").isInt({ min: 1, max: 72 })];
export const childMonthValidation = [param("childId").isUUID(), query("month").optional().isInt({ min: 1, max: 72 })];

export const milestoneCheckIdValidation = [param("childId").isUUID(), param("milestoneId").isUUID()];

const timeRange = [query("from").optional().isISO8601(), query("to").optional().isISO8601()];
export const listCareViewValidation = [param("childId").isUUID(), ...timeRange];

export const createFeedingValidation = [
  param("childId").isUUID(),
  body("feedingType").isIn(FEEDING_TYPES),
  body("startTime").isISO8601(),
  body("endTime").optional({ values: "null" }).isISO8601(),
  body("amountMl").optional({ values: "null" }).isFloat({ min: 0, max: 2000 }),
  body("side").optional({ values: "null" }).isIn(["left", "right", "both"]),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const createSleepValidation = [
  param("childId").isUUID(),
  body("sleepType").isIn(SLEEP_TYPES),
  body("startTime").isISO8601(),
  body("endTime").optional({ values: "null" }).isISO8601(),
  body("qualityRating").optional({ values: "null" }).isInt({ min: 1, max: 5 }),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const createDiaperValidation = [
  param("childId").isUUID(),
  body("diaperType").isIn(DIAPER_TYPES),
  body("changeTime").isISO8601(),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const updateProfileValidation = [
  body("fullName").optional({ values: "null" }).isString().trim().isLength({ min: 1, max: 80 }),
  body("languagePreference").optional().isString().isLength({ min: 2, max: 16 }),
  body("phoneNumber").optional({ values: "null" }).isString().isLength({ max: 30 }),
  body("gender").optional({ values: "null" }).isIn(["female", "male", "other", "prefer_not_to_say"]),
  isoDate(body("birthdate").optional({ values: "null" })),
  body("profilePictureUrl").optional({ values: "null" }).isString().isLength({ max: 1000 }),
  body("relationToBaby").optional({ values: "null" }).isString().isLength({ max: 40 })
];

export const setActiveChildValidation = [body("childId").isUUID()];
export const idValidation = [param("id").isUUID()];

export const listActivitiesValidation = [
  query("month").optional().isInt({ min: 0, max: 72 }),
  query("category").optional().isString().isLength({ max: 40 }),
  query("subCategory").optional().isString().isLength({ max: 80 }),
  query("search").optional().isString().isLength({ max: 120 })
];

export const childActivityValidation = [param("childId").isUUID(), param("activityId").isUUID()];

export const completeActivityValidation = [
  ...childActivityValidation,
  body("rating").optional().isInt({ min: 1, max: 5 }),
  body("difficultyFeedback").optional().isIn(DIFFICULTY_FEEDBACK),
  body("notes").optional().isString().isLength({ max: 1000 })
];

export const difficultyValidation = [...childActivityValidation, body("feedback").isIn(DIFFICULTY_FEEDBACK)];

export const dailyPlanValidation = [param("childId").isUUID(), query("date").optional().isISO8601({ strict: true }).isLength({ min: 10, max: 10 })];
export const completeSlotValidation = [...dailyPlanValidation, param("slot").isInt({ min: 1, max: 4 })];

export const updatesForAgeValidation = [query("ageInMonths").isInt({ min: 0, max: 72 })];
export const listRecipesValidation = [query("category").optional().isString().isLength({ max: 40 }), query("target").optional().isIn(["baby", "mum"])];
export const ageGroupValidation = [param("group").isString().isLength({ max: 10 }), query("mealSlot").optional().isString().isLength({ max: 40 })];
export const listArticlesValidation = [
  query("category").optional().isString().isLength({ max: 60 }),
  query("month").optional().isInt({ min: 0, max: 72 }),
  query("q").optional().isString().isLength({ max: 120 })
];
export const searchArticlesValidation = [query("q").isString().trim().isLength({ min: 1, max: 120 })];
export const listStoriesValidation = [query("ageMonths").optional().isInt({ min: 0, max: 72 }), query("search").optional().isString().isLength({ max: 120 })];
