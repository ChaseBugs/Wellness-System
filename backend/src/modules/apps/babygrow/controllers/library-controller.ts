import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CompleteActivityInput, DifficultyFeedback } from "../models/library.js";
import type { ActivityLibraryService } from "../services/activity-library-service.js";
import type { ReadingLibraryService } from "../services/reading-library-service.js";

const optionalNumber = (value: string | undefined) => (value === undefined ? undefined : Number(value));

/** Activities, daily plan, daily updates, recipes, articles and stories. */
export class LibraryController extends BaseController {
  constructor(
    private activityLibrary: ActivityLibraryService,
    private readingLibrary: ReadingLibraryService
  ) {
    super();
  }

  activities = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.activityLibrary.list(this.userId(req), {
        month: optionalNumber(this.query(req, "month")),
        category: this.query(req, "category"),
        subCategory: this.query(req, "subCategory"),
        search: this.query(req, "search")
      })
    );
  });

  activity = this.handle(async (req, res) => {
    sendSuccess(res, await this.activityLibrary.get(this.userId(req), this.param(req, "id")));
  });

  subCategories = this.handle(async (_req, res) => {
    sendSuccess(res, await this.activityLibrary.subCategories());
  });

  activityHistory = this.handle(async (req, res) => {
    sendSuccess(res, await this.activityLibrary.history(this.userId(req), this.param(req, "childId")));
  });

  completeActivity = this.handle(async (req, res) => {
    const body = req.body as CompleteActivityInput;
    const result = await this.activityLibrary.complete(this.userId(req), this.param(req, "childId"), this.param(req, "activityId"), {
      rating: body.rating,
      difficultyFeedback: body.difficultyFeedback,
      notes: body.notes
    });
    sendSuccess(res, result, 201);
  });

  setDifficulty = this.handle(async (req, res) => {
    const feedback = req.body.feedback as DifficultyFeedback;
    sendSuccess(res, await this.activityLibrary.setDifficulty(this.userId(req), this.param(req, "childId"), this.param(req, "activityId"), feedback));
  });

  dailyPlan = this.handle(async (req, res) => {
    sendSuccess(res, await this.activityLibrary.dailyPlan(this.userId(req), this.param(req, "childId"), this.query(req, "date")));
  });

  completeDailySlot = this.handle(async (req, res) => {
    const slot = Number(this.param(req, "slot"));
    sendSuccess(res, await this.activityLibrary.completeDailySlot(this.userId(req), this.param(req, "childId"), slot, this.query(req, "date")));
  });

  todaysUpdates = this.handle(async (req, res) => {
    sendSuccess(res, await this.activityLibrary.todaysUpdates(this.userId(req), this.param(req, "childId")));
  });

  updatesForAge = this.handle(async (req, res) => {
    sendSuccess(res, await this.activityLibrary.updatesForAge(Number(this.query(req, "ageInMonths"))));
  });

  recipes = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.recipes(this.userId(req), { category: this.query(req, "category"), target: this.query(req, "target") }));
  });

  recipe = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.recipe(this.userId(req), this.param(req, "id")));
  });

  childRecipes = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.recipesForChild(this.userId(req), this.param(req, "childId")));
  });

  recipesByAgeGroup = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.recipesByAgeGroup(this.userId(req), this.param(req, "group"), this.query(req, "mealSlot")));
  });

  favoriteRecipes = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.favoriteRecipes(this.userId(req)));
  });

  articles = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.readingLibrary.articles(this.userId(req), {
        category: this.query(req, "category"),
        month: optionalNumber(this.query(req, "month")),
        q: this.query(req, "q")
      })
    );
  });

  article = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.article(this.userId(req), this.param(req, "id")));
  });

  bookmarkedArticles = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.bookmarkedArticles(this.userId(req)));
  });

  stories = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.readingLibrary.stories(this.userId(req), { ageMonths: optionalNumber(this.query(req, "ageMonths")), search: this.query(req, "search") })
    );
  });

  story = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.story(this.userId(req), this.param(req, "id")));
  });

  bookmarkedStories = this.handle(async (req, res) => {
    sendSuccess(res, await this.readingLibrary.bookmarkedStories(this.userId(req)));
  });

  /** PUT saves, DELETE removes; the content type comes from the route. */
  bookmark(type: "recipe" | "article" | "story", saved: boolean) {
    return this.handle(async (req, res) => {
      sendSuccess(res, await this.readingLibrary.setBookmark(this.userId(req), type, this.param(req, "id"), saved));
    });
  }
}
