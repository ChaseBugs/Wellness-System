const express = require("express");
const User = require("../models/User");
const Exercise = require("../models/Exercise");
const TrainingPlan = require("../models/TrainingPlan");
const Article = require("../models/Article");
const Banner = require("../models/Banner");
const DailyLog = require("../models/DailyLog");
const Goal = require("../models/Goal");
const Notification = require("../models/Notification");
const AppSetting = require("../models/AppSetting");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, requireAdmin } = require("../middleware/auth");
const HttpError = require("../utils/httpError");
const buildListQuery = require("../utils/query");

const router = express.Router();

router.use(authenticate, requireAdmin);

const resources = {
  users: {
    model: User,
    search: ["name", "email"],
    select: "-passwordHash"
  },
  exercises: {
    model: Exercise,
    search: ["title", "category"]
  },
  "training-plans": {
    model: TrainingPlan,
    search: ["title", "subtitle", "description"],
    populate: "exercises.exercise"
  },
  articles: {
    model: Article,
    search: ["title", "excerpt", "body"]
  },
  banners: {
    model: Banner,
    search: ["title", "subtitle", "placement"]
  },
  logs: {
    model: DailyLog,
    search: ["notes"],
    populate: "user completedExercises.exercise"
  },
  goals: {
    model: Goal,
    search: ["title"],
    populate: "user"
  },
  notifications: {
    model: Notification,
    search: ["title", "message"]
  },
  settings: {
    model: AppSetting,
    search: ["key", "description"]
  }
};

function getResource(name) {
  const resource = resources[name];
  if (!resource) {
    throw new HttpError(404, "Admin resource not found");
  }
  return resource;
}

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      users,
      activeUsers,
      exercises,
      plans,
      articles,
      logsToday,
      notifications
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", status: "active" }),
      Exercise.countDocuments({ isActive: true }),
      TrainingPlan.countDocuments({ isActive: true }),
      Article.countDocuments({ isPublished: true }),
      DailyLog.countDocuments({ date: { $gte: startOfToday } }),
      Notification.countDocuments({ isActive: true })
    ]);

    const latestLogs = await DailyLog.find()
      .sort("-date")
      .limit(6)
      .populate("user", "name email")
      .lean();

    const from = new Date(now);
    from.setDate(from.getDate() - 13);
    from.setHours(0, 0, 0, 0);

    const logTrendRaw = await DailyLog.aggregate([
      { $match: { date: { $gte: from } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          entries: { $sum: 1 },
          workoutMinutes: { $sum: "$workoutMinutes" },
          averageSleepHours: { $avg: "$sleepHours" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const workoutByDay = logTrendRaw.map((row) => ({
      label: `${row._id.month}/${row._id.day}`,
      entries: row.entries,
      workoutMinutes: row.workoutMinutes || 0,
      averageSleepHours: Number((row.averageSleepHours || 0).toFixed(1))
    }));

    res.json({
      totals: { users, activeUsers, exercises, plans, articles, logsToday, notifications },
      latestLogs,
      charts: {
        workoutByDay,
        contentMix: [
          { label: "Exercises", value: exercises },
          { label: "Plans", value: plans },
          { label: "Articles", value: articles },
          { label: "Push", value: notifications }
        ],
        users: [
          { label: "Active", value: activeUsers },
          { label: "Inactive", value: Math.max(users - activeUsers, 0) }
        ]
      }
    });
  })
);

router.get(
  "/:resource",
  asyncHandler(async (req, res) => {
    const { model, search, populate, select } = getResource(req.params.resource);
    const { page, limit, skip, sort, filter } = buildListQuery(req, search);
    let query = model.find(filter).sort(sort).skip(skip).limit(limit);

    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);

    const [items, total] = await Promise.all([
      query.lean({ virtuals: true }),
      model.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  })
);

router.get(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const { model, populate, select } = getResource(req.params.resource);
    let query = model.findById(req.params.id);

    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);

    const item = await query;
    if (!item) throw new HttpError(404, "Item not found");

    res.json({ item });
  })
);

router.post(
  "/:resource",
  asyncHandler(async (req, res) => {
    const { model } = getResource(req.params.resource);
    const payload = { ...req.body };

    if (req.params.resource === "users" && payload.password) {
      const user = new model(payload);
      user.password = payload.password;
      delete user.password;
      await user.save();
      return res.status(201).json({ item: user });
    }

    const item = await model.create(payload);
    res.status(201).json({ item });
  })
);

router.patch(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const { model } = getResource(req.params.resource);
    const payload = { ...req.body };

    if (req.params.resource === "users" && payload.password) {
      const user = await model.findById(req.params.id).select("+passwordHash");
      if (!user) throw new HttpError(404, "Item not found");
      Object.assign(user, payload);
      user.password = payload.password;
      await user.save();
      return res.json({ item: user });
    }

    delete payload.password;
    delete payload.passwordHash;

    const item = await model.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!item) throw new HttpError(404, "Item not found");
    res.json({ item });
  })
);

router.delete(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const { model } = getResource(req.params.resource);
    const item = await model.findByIdAndDelete(req.params.id);

    if (!item) throw new HttpError(404, "Item not found");
    res.json({ deleted: true });
  })
);

module.exports = router;
