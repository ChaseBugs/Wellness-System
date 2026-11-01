/**
 * BabyGrow's library DTOs. The content itself is stored in the Content Factory (content.items);
 * these flat shapes are what the TalentBaby app renders.
 */
export const ACTIVITY_CATEGORIES = ["physical", "cognitive", "communication", "social"] as const;
export const DIFFICULTY_FEEDBACK = ["too_easy", "just_right", "too_hard"] as const;
export type DifficultyFeedback = (typeof DIFFICULTY_FEEDBACK)[number];

export const BABY_AGE_GROUPS = [
  { group: "0-6", min: 0, max: 6 },
  { group: "7-11", min: 7, max: 11 },
  { group: "12-17", min: 12, max: 17 },
  { group: "18-24", min: 18, max: 24 },
  { group: "25-30", min: 25, max: 30 },
  { group: "31-36", min: 31, max: 36 }
] as const;

export interface ActivityResponse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  subCategory: string | null;
  monthMin: number | null;
  monthMax: number | null;
  durationMinutes: number | null;
  difficultyLevel: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  materialsNeeded: string[];
  instructions: string | null;
  benefits: string[];
  frequency: string | null;
  doneCount: number;
  isPremium: boolean;
  locked: boolean;
  expertReviewed: boolean;
}

export interface ActivityLog {
  id: string;
  childId: string;
  contentId: string;
  completedAt: Date;
  rating: number | null;
  difficultyFeedback: DifficultyFeedback | null;
  notes: string | null;
}

export interface CompleteActivityInput {
  rating?: number;
  difficultyFeedback?: DifficultyFeedback;
  notes?: string;
}

export interface ActivityHistoryResponse {
  logId: string;
  completedAt: Date;
  rating: number | null;
  difficultyFeedback: DifficultyFeedback | null;
  notes: string | null;
  activity: ActivityResponse;
}

export interface DailyPlanSlot {
  id: string;
  childId: string;
  planDate: string;
  slot: number;
  contentId: string;
  completedAt: Date | null;
}

export interface DailyActivityResponse {
  dailyId: string;
  slot: number;
  planDate: string;
  isCompleted: boolean;
  completedAt: Date | null;
  activity: ActivityResponse;
}

export interface DailyUpdateResponse {
  id: string;
  ageInMonths: number | null;
  contentType: string | null;
  title: string;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: Date;
}

export interface RecipeIngredient {
  name: string;
  amount?: number | null;
  unit?: string | null;
  notes?: string | null;
}

export interface BabyRecipeResponse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  recipeType: string | null;
  mealSlot: string | null;
  target: string | null;
  ageGroup: string | null;
  prepTimeMinutes: number | null;
  cookingTimeMinutes: number | null;
  servings: number | null;
  calories: number | null;
  ingredients: Array<RecipeIngredient | string>;
  instructions: string[];
  nutritionInfo: Record<string, unknown>;
  imageUrl: string | null;
  isPremium: boolean;
  locked: boolean;
  isFavorite: boolean;
  expertReviewed: boolean;
}

export interface ArticleResponse {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  imageUrl: string | null;
  author: string | null;
  doctorName: string | null;
  doctorCredentials: string | null;
  isPremium: boolean;
  locked: boolean;
  isBookmarked: boolean;
  expertReviewed: boolean;
  createdAt: Date;
}

export interface StoryResponse {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  author: string | null;
  narrator: string | null;
  ageGroup: string | null;
  durationMinutes: number | null;
  isPremium: boolean;
  locked: boolean;
  isBookmarked: boolean;
  expertReviewed: boolean;
}
