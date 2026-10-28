const mongoose = require("mongoose");
const connectDb = require("./config/db");
const env = require("./config/env");
const User = require("./models/User");
const Exercise = require("./models/Exercise");
const TrainingPlan = require("./models/TrainingPlan");
const Article = require("./models/Article");
const Banner = require("./models/Banner");
const DailyLog = require("./models/DailyLog");
const Goal = require("./models/Goal");
const Notification = require("./models/Notification");
const AppSetting = require("./models/AppSetting");

const baseContentFlags = {
  doctor_verified: false,
  setup: false
};

const bannerFlags = {
  setup: false
};

function daysAgo(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedUsers() {
  const admin = new User({
    name: "Height Admin",
    email: env.adminEmail,
    role: "admin",
    status: "active"
  });
  admin.password = env.adminPassword;

  const user = new User({
    name: "Demo User",
    email: "demo@height.local",
    role: "user",
    status: "active",
    streakDays: 6,
    points: 420,
    measurements: {
      currentHeightCm: 151,
      targetHeightCm: 158,
      weightKg: 42,
      birthDate: new Date("2011-08-12"),
      gender: "female"
    },
    preferences: {
      units: "metric",
      notificationsEnabled: true
    }
  });
  user.password = "Demo123!";

  await admin.save();
  await user.save();
  return { admin, user };
}

async function seedExercises() {
  const rawExercises = [
    ["Jumping Jacks", "cardio", 20, "Full body warmup to raise heart rate before stretching.", ["Stand tall with feet together.", "Jump feet apart while lifting arms overhead.", "Return to starting position with control."]],
    ["Standing Back Stretches", "stretching", 20, "A standing side and back stretch for posture mobility.", ["Stand with feet shoulder width apart.", "Reach both hands overhead.", "Lean gently from side to side."]],
    ["Hip Hinge", "posture", 20, "Teaches hip movement while keeping the spine long.", ["Stand tall with soft knees.", "Push hips back and lower the torso.", "Return by squeezing glutes."]],
    ["Kneeling Lunge Stretch Left", "stretching", 20, "Opens the left hip flexor and front body.", ["Place left knee on the floor.", "Step the right foot forward.", "Shift hips forward gently."]],
    ["Kneeling Lunge Stretch Right", "stretching", 20, "Opens the right hip flexor and front body.", ["Place right knee on the floor.", "Step the left foot forward.", "Shift hips forward gently."]],
    ["Calf Stretch Left", "stretching", 20, "Lengthens the left calf and ankle line.", ["Step left foot back.", "Press heel toward the floor.", "Keep the torso upright."]],
    ["Calf Stretch Right", "stretching", 20, "Lengthens the right calf and ankle line.", ["Step right foot back.", "Press heel toward the floor.", "Keep the torso upright."]],
    ["Cobra Stretch", "yoga", 30, "A gentle spine extension for posture and flexibility.", ["Lie face down.", "Place palms under shoulders.", "Lift chest while keeping hips grounded."]],
    ["Child Pose Reach", "yoga", 30, "Relaxes the back and shoulders after training.", ["Sit hips toward heels.", "Reach arms forward.", "Breathe slowly."]],
    ["Wall Posture Hold", "posture", 45, "Builds awareness for tall standing posture.", ["Stand with back near a wall.", "Touch head, shoulders, and hips to the wall.", "Hold and breathe evenly."]]
  ];

  return Exercise.insertMany(
    rawExercises.map(([title, category, durationSeconds, description, steps], index) => ({
      title,
      slug: slugify(title),
      category,
      durationSeconds,
      calories: index < 2 ? 8 : 4,
      difficulty: index > 7 ? "intermediate" : "beginner",
      ageGroup: "10+",
      imageUrl: `/images/exercises/${slugify(title)}.png`,
      equipment: [],
      targetAreas: ["posture", "mobility"],
      steps,
      tips: [description, "Stop if you feel pain or dizziness."],
      sortOrder: index + 1,
      isActive: true,
      ...baseContentFlags
    }))
  );
}

async function seedTrainingPlans(exercises) {
  const findExercise = (title) => exercises.find((exercise) => exercise.title === title);
  const toPlanExercise = (title, order) => ({
    exercise: findExercise(title)._id,
    order,
    durationSeconds: findExercise(title).durationSeconds,
    sets: 1,
    restSeconds: 10
  });

  return TrainingPlan.insertMany([
    {
      title: "My Training",
      subtitle: "Daily height increase routine",
      description: "A short starter routine matching the custom training flow from the mobile design.",
      level: "beginner",
      type: "featured",
      bannerImageUrl: "/images/banners/my-training.jpg",
      icon: "plus",
      estimatedMinutes: 5,
      goal: "Improve posture, consistency, and flexibility.",
      exercises: [toPlanExercise("Jumping Jacks", 1), toPlanExercise("Standing Back Stretches", 2)],
      tags: ["daily", "starter"],
      isPremium: false,
      isActive: true,
      sortOrder: 1,
      ...baseContentFlags
    },
    {
      title: "Before Age 18",
      subtitle: "Posture and stretch plan",
      description: "A beginner plan for young users focused on safe mobility and habit building.",
      level: "beginner",
      type: "daily",
      bannerImageUrl: "/images/banners/before-age-18.jpg",
      icon: "lightbulb",
      estimatedMinutes: 8,
      goal: "Build a consistent daily workout habit.",
      exercises: [
        toPlanExercise("Jumping Jacks", 1),
        toPlanExercise("Hip Hinge", 2),
        toPlanExercise("Kneeling Lunge Stretch Left", 3),
        toPlanExercise("Kneeling Lunge Stretch Right", 4),
        toPlanExercise("Wall Posture Hold", 5)
      ],
      tags: ["growth", "posture", "beginner"],
      isPremium: false,
      isActive: true,
      sortOrder: 2,
      ...baseContentFlags
    },
    {
      title: "Flexibility Booster",
      subtitle: "Stretch routine",
      description: "A calm stretching routine for reports, streaks, and daily plan screens.",
      level: "intermediate",
      type: "weekly",
      bannerImageUrl: "/images/banners/stretch-routine.jpg",
      icon: "fire",
      estimatedMinutes: 10,
      goal: "Improve mobility and body alignment.",
      exercises: [
        toPlanExercise("Standing Back Stretches", 1),
        toPlanExercise("Calf Stretch Left", 2),
        toPlanExercise("Calf Stretch Right", 3),
        toPlanExercise("Cobra Stretch", 4),
        toPlanExercise("Child Pose Reach", 5)
      ],
      tags: ["stretch", "weekly"],
      isPremium: true,
      isActive: true,
      sortOrder: 3,
      ...baseContentFlags
    }
  ]);
}

async function seedArticles() {
  return Article.insertMany([
    {
      title: "Nutrition Suggestions for You",
      slug: "nutrition-suggestions-for-you",
      category: "nutrition",
      excerpt: "Simple food habits that support training recovery and normal development.",
      body: "Balanced meals, enough protein, calcium rich foods, fruits, vegetables, and hydration help support overall wellness. The app should present this as general education, not medical treatment.",
      imageUrl: "/images/articles/nutrition.jpg",
      readMinutes: 3,
      tags: ["nutrition", "food", "wellness"],
      isFeatured: true,
      isPublished: true,
      ...baseContentFlags
    },
    {
      title: "Sleep Tracker",
      slug: "sleep-tracker",
      category: "sleep",
      excerpt: "Adequate sleep helps recovery and keeps the daily routine consistent.",
      body: "The reports tab can track sleep hours beside workouts and weight. Use sleep insights to encourage consistency and regular bedtime habits.",
      imageUrl: "/images/articles/sleep.jpg",
      readMinutes: 2,
      tags: ["sleep", "reports"],
      isFeatured: true,
      isPublished: true,
      ...baseContentFlags
    },
    {
      title: "High Heels Make You Taller",
      slug: "high-heels-make-you-taller",
      category: "fashion",
      excerpt: "Your height can look higher by choosing footwear that adds visible lift.",
      body: "This article belongs in the Discover feed as fashion advice. It should be clearly separated from workout or health guidance.",
      imageUrl: "/images/articles/high-heels.jpg",
      readMinutes: 2,
      tags: ["style", "discover"],
      isFeatured: false,
      isPublished: true,
      ...baseContentFlags
    },
    {
      title: "Every Workout Counts",
      slug: "every-workout-counts",
      category: "motivation",
      excerpt: "Your height routine is built brick by brick with daily effort.",
      body: "Use this motivational content for reminders, streak cards, and report screens. It focuses on habit building rather than making medical claims.",
      imageUrl: "/images/articles/workout-counts.jpg",
      readMinutes: 1,
      tags: ["motivation", "streak"],
      isFeatured: false,
      isPublished: true,
      ...baseContentFlags
    }
  ]);
}

async function seedBanners() {
  return Banner.insertMany([
    {
      title: "Every workout sends a grow taller signal",
      subtitle: "Your dream height is calling.",
      placement: "home-top",
      icon: "sparkle",
      backgroundColor: "#eef5ff",
      priority: 10,
      isActive: true,
      ...bannerFlags
    },
    {
      title: "Set weekly goal for your height",
      subtitle: "Create a target and follow your plan.",
      placement: "home-card",
      imageUrl: "/images/banners/weekly-goal.png",
      icon: "goal",
      ctaLabel: "Add",
      ctaUrl: "app://goals/new",
      backgroundColor: "#ffffff",
      priority: 8,
      isActive: true,
      ...bannerFlags
    },
    {
      title: "New Version",
      subtitle: "98.4% of users are loving the latest version.",
      placement: "modal",
      imageUrl: "/images/banners/rocket.png",
      ctaLabel: "Update",
      ctaUrl: "app://update",
      backgroundColor: "#bdefff",
      priority: 20,
      isActive: true,
      ...bannerFlags
    },
    {
      title: "A Good Start!",
      subtitle: "Your height is built brick by brick - every daily workout counts.",
      placement: "reports-top",
      imageUrl: "/images/banners/giraffe.png",
      backgroundColor: "#2f4a78",
      priority: 12,
      isActive: true,
      ...bannerFlags
    }
  ]);
}

async function seedUserData(user, exercises) {
  await Goal.insertMany([
    {
      user: user._id,
      title: "Set weekly goal for your height",
      type: "workout",
      targetValue: 5,
      currentValue: 2,
      unit: "days",
      startsAt: daysAgo(2),
      dueAt: daysAgo(-5),
      status: "active"
    },
    {
      user: user._id,
      title: "Reach target height",
      type: "height",
      targetValue: 158,
      currentValue: 151,
      unit: "cm",
      startsAt: daysAgo(14),
      dueAt: daysAgo(-120),
      status: "active"
    }
  ]);

  await DailyLog.insertMany([
    {
      user: user._id,
      date: daysAgo(6),
      heightCm: 150.6,
      weightKg: 42.4,
      sleepHours: 7.5,
      waterGlasses: 6,
      mood: "good",
      workoutMinutes: 5,
      completedExercises: [{ exercise: exercises[0]._id, title: exercises[0].title, durationSeconds: 20, calories: 8 }],
      notes: "Started daily height routine."
    },
    {
      user: user._id,
      date: daysAgo(3),
      heightCm: 150.8,
      weightKg: 42.1,
      sleepHours: 8,
      waterGlasses: 7,
      mood: "great",
      workoutMinutes: 8,
      completedExercises: [
        { exercise: exercises[1]._id, title: exercises[1].title, durationSeconds: 20, calories: 4 },
        { exercise: exercises[2]._id, title: exercises[2].title, durationSeconds: 20, calories: 4 }
      ],
      notes: "Completed posture exercises."
    },
    {
      user: user._id,
      date: daysAgo(0),
      heightCm: 151,
      weightKg: 42,
      sleepHours: 7,
      waterGlasses: 5,
      mood: "good",
      workoutMinutes: 6,
      completedExercises: [{ exercise: exercises[3]._id, title: exercises[3].title, durationSeconds: 20, calories: 4 }],
      notes: "Logged today's progress."
    }
  ]);
}

async function seedNotifications() {
  await Notification.insertMany([
    {
      title: "Daily workout reminder",
      message: "Every workout counts. Complete today's height routine.",
      audience: "all",
      type: "reminder",
      isActive: true,
      ...bannerFlags
    },
    {
      title: "New version available",
      message: "Upgrade now to enjoy improved performance and enhanced stability.",
      audience: "all",
      type: "update",
      isActive: true,
      ...bannerFlags
    }
  ]);
}

async function seedSettings() {
  await AppSetting.insertMany([
    {
      key: "app_version_modal",
      value: {
        enabled: true,
        title: "New Version",
        scoreText: "98.4% of users are loving the latest version!",
        buttonText: "Update"
      },
      description: "Controls the update modal shown in the home design.",
      setup: false
    },
    {
      key: "medical_disclaimer",
      value: {
        enabled: true,
        text: "Exercises and articles are for general wellness and fitness education. Consult a qualified professional for medical advice."
      },
      description: "Shown before workouts and health content where needed.",
      setup: false
    }
  ]);
}

async function clearDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Exercise.deleteMany({}),
    TrainingPlan.deleteMany({}),
    Article.deleteMany({}),
    Banner.deleteMany({}),
    DailyLog.deleteMany({}),
    Goal.deleteMany({}),
    Notification.deleteMany({}),
    AppSetting.deleteMany({})
  ]);
}

async function main() {
  await connectDb();
  await clearDatabase();
  const { user } = await seedUsers();
  const exercises = await seedExercises();
  await seedTrainingPlans(exercises);
  await seedArticles();
  await seedBanners();
  await seedUserData(user, exercises);
  await seedNotifications();
  await seedSettings();

  console.log("Seed complete");
  console.log(`Admin: ${env.adminEmail} / ${env.adminPassword}`);
  console.log("Demo user: demo@height.local / Demo123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
