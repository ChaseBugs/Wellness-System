const express = require("express");
const Exercise = require("../models/Exercise");
const TrainingPlan = require("../models/TrainingPlan");
const Article = require("../models/Article");
const Banner = require("../models/Banner");
const DailyLog = require("../models/DailyLog");
const Goal = require("../models/Goal");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate } = require("../middleware/auth");
const HttpError = require("../utils/httpError");

const router = express.Router();

router.get(
  "/home",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const activeBannerFilter = {
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }
      ]
    };

    const [topBanners, featuredPlans, articles] = await Promise.all([
      Banner.find(activeBannerFilter).sort("-priority").limit(8).lean(),
      TrainingPlan.find({ isActive: true })
        .sort("sortOrder -createdAt")
        .limit(5)
        .populate("exercises.exercise")
        .lean(),
      Article.find({ isPublished: true })
        .sort("-isFeatured -publishedAt")
        .limit(8)
        .lean()
    ]);

    res.json({
      greeting: "Every workout sends a grow taller signal - your dream height is calling!",
      cards: {
        myTraining: featuredPlans[0] || null,
        more: articles.slice(0, 4)
      },
      banners: topBanners,
      articles
    });
  })
);

router.get(
  "/exercises",
  asyncHandler(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.difficulty = req.query.level;

    const exercises = await Exercise.find(filter).sort("sortOrder title").lean();
    res.json({ items: exercises });
  })
);

router.get(
  "/training-plans",
  asyncHandler(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.level) filter.level = req.query.level;
    if (req.query.type) filter.type = req.query.type;

    const plans = await TrainingPlan.find(filter)
      .sort("sortOrder -createdAt")
      .populate("exercises.exercise")
      .lean();

    res.json({ items: plans });
  })
);

router.get(
  "/articles",
  asyncHandler(async (req, res) => {
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;

    const articles = await Article.find(filter).sort("-publishedAt").lean();
    res.json({ items: articles });
  })
);

router.use(authenticate);

router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const [activeGoals, latestLogs] = await Promise.all([
      Goal.find({ user: req.user._id, status: "active" }).sort("dueAt").lean(),
      DailyLog.find({ user: req.user._id }).sort("-date").limit(7).lean()
    ]);

    res.json({
      user: req.user,
      activeGoals,
      latestLogs
    });
  })
);

router.patch(
  "/profile",
  asyncHandler(async (req, res) => {
    const allowed = ["name", "avatarUrl", "measurements", "preferences"];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        req.user[key] = req.body[key];
      }
    }

    await req.user.save();
    res.json({ user: req.user });
  })
);

router.get(
  "/reports",
  asyncHandler(async (req, res) => {
    const logs = await DailyLog.find({ user: req.user._id })
      .sort("-date")
      .limit(Number(req.query.limit || 30))
      .lean();

    const totals = logs.reduce(
      (acc, log) => {
        acc.workoutMinutes += log.workoutMinutes || 0;
        acc.sleepHours += log.sleepHours || 0;
        acc.entries += 1;
        return acc;
      },
      { workoutMinutes: 0, sleepHours: 0, entries: 0 }
    );

    res.json({
      summary: {
        workoutMinutes: totals.workoutMinutes,
        averageSleepHours: totals.entries ? Number((totals.sleepHours / totals.entries).toFixed(1)) : 0,
        streakDays: req.user.streakDays,
        currentHeightCm: req.user.measurements?.currentHeightCm,
        targetHeightCm: req.user.measurements?.targetHeightCm
      },
      logs
    });
  })
);

router.post(
  "/logs",
  asyncHandler(async (req, res) => {
    if (!req.body.date) {
      throw new HttpError(400, "date is required");
    }

    const date = new Date(req.body.date);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const payload = {
      ...req.body,
      date: day,
      user: req.user._id
    };

    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date: day },
      payload,
      { new: true, upsert: true, runValidators: true }
    );

    if (payload.heightCm || payload.weightKg) {
      req.user.measurements = {
        ...(req.user.measurements || {}),
        currentHeightCm: payload.heightCm || req.user.measurements?.currentHeightCm,
        weightKg: payload.weightKg || req.user.measurements?.weightKg
      };
      await req.user.save();
    }

    res.status(201).json({ item: log });
  })
);

router.post(
  "/goals",
  asyncHandler(async (req, res) => {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ item: goal });
  })
);

module.exports = router;
