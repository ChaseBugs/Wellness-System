// Shared API response types — single source of truth for the admin panel

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: { total: number; page: number; limit: number; pages: number };
}

// ─── Users / Auth ─────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  gender?: string;
  birthdate?: string;
  profile_picture_url?: string;
  role: 'user' | 'doctor' | 'agent' | 'admin';
  is_premium?: boolean;
  relation_to_baby?: string;
  active_baby_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithBabies extends User {
  babies: Baby[];
}

// ─── Babies ───────────────────────────────────────────────────────────────

export interface Baby {
  id: number;
  user_id: number;
  name: string;
  birth_date: string;
  gender?: 'male' | 'female';
  birth_weight_kg?: number;
  birth_height_cm?: number;
  profile_picture_url?: string;
  created_at: string;
}

// ─── Activities ───────────────────────────────────────────────────────────

export interface Activity {
  id: number;
  title: string;
  description?: string;
  category: string;
  sub_category?: string;
  month_min: number;
  month_max: number;
  age_range_min_months: number;
  age_range_max_months: number;
  duration_minutes?: number;
  difficulty_level?: string;
  benefits?: string[];
  frequency?: string;
  materials_needed?: string[];
  instructions?: string;
  image_url?: string;
  video_url?: string;
  done_count?: number;
  is_premium?: boolean;
  doctor_verified?: boolean;
  created_at: string;
}

// ─── Articles ─────────────────────────────────────────────────────────────

export interface Article {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  category?: string;
  author?: string;
  image_url?: string;
  is_featured?: boolean;
  view_count?: number;
  read_time_minutes?: number;
  reading_time_minutes?: number;
  doctor_name?: string;
  doctor_credentials?: string;
  doctor_verified?: boolean;
  age_min_months?: number;
  age_max_months?: number;
  created_at: string;
}

export interface UserArticle {
  id: number;
  user_id: number;
  title: string;
  content?: string;
  category: string;
  tags?: string[];
  thumbnail_url?: string;
  status: 'published' | 'draft' | 'hidden';
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name?: string;
  author_role?: 'user' | 'doctor';
  doctor_grade?: string;
  doctor_specialty?: string;
}

// ─── Milestone Definitions ────────────────────────────────────────────────

export type MilestoneType = 'physical' | 'cognitive' | 'communication' | 'social_emotional';
export type MilestoneStatus = 'yes' | 'no' | 'almost' | 'unanswered';

export interface MilestoneDefinition {
  id: number;
  month: number;
  milestone_type: MilestoneType;
  title: string;
  description: string;
  question?: string;
  related_activity?: string;
  display_order: number;
  doctor_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Baby Milestone Progress ──────────────────────────────────────────────

export interface BabyMilestoneItem extends MilestoneDefinition {
  status: MilestoneStatus;
  achieved_date: string | null;
  notes: string | null;
}

export interface MilestoneTypeSummary {
  total: number;
  yes: number;
  almost: number;
  no: number;
  unanswered: number;
  milestones: BabyMilestoneItem[];
}

export interface MilestoneReport {
  baby_id: number;
  month: number;
  overall: {
    total: number;
    yes: number;
    almost: number;
    completion_rate: number;
  };
  by_type: Record<MilestoneType, MilestoneTypeSummary>;
}

// ─── Recipes ──────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  id?: number;
  recipe_id?: number;
  name: string;
  amount?: string;   // "2-4 tbsp", "½ cup", "4+ oz"
  unit?: string;     // optional separate unit
  notes?: string;
  image_url?: string;
  sort_order?: number;
}

export interface RecipeNutritionInfo {
  nutrients?: string[];       // ["Fiber", "Vitamin C", ...]
  steps?: string[];           // cooking steps (from instructions array)
  instructions?: string[];    // safety/serving guidelines
  general_notes?: string[];   // doctor advice + safety notes
  doctor_verified?: boolean;
  safety_notes?: string[];
  source?: string;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  target?: 'baby' | 'mum';
  meal_slot?: string;
  baby_age_group?: string;
  age_range_min_months: number;
  age_range_max_months: number;
  recipe_type: string;
  ingredients?: string[];                    // legacy flat strings kept for compatibility
  recipe_ingredients?: RecipeIngredient[];   // structured rows from recipe_ingredients table
  instructions?: string[];
  nutrition_info?: RecipeNutritionInfo;
  prep_time_minutes?: number;
  cooking_time_minutes?: number;
  image_url?: string;
  created_at: string;
}

// ─── Nutrition Benefits ───────────────────────────────────────────────────

export interface NutritionCategory {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
  sort_order: number;
}

export interface NutritionFood {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  image_url?: string;
  is_vegetarian: boolean;
  age_groups?: string;
  sort_order: number;
}

// ─── Stories ──────────────────────────────────────────────────────────────

export interface Story {
  id: number;
  title: string;
  content?: string;
  audio_url?: string;
  image_url?: string;
  duration_minutes?: number;
  age_range_min_months?: number;
  age_range_max_months?: number;
  age_min_months?: number;
  age_max_months?: number;
  is_featured?: boolean;
  category?: string;
  author?: string;
  created_at: string;
}

// ─── Expert Classes ───────────────────────────────────────────────────────

export interface ExpertClass {
  id: number;
  title: string;
  description?: string;
  instructor_name?: string;
  class_type: 'live' | 'on_demand';
  scheduled_time?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  category?: string;
  is_premium?: boolean;
  created_at: string;
}

// ─── Community ────────────────────────────────────────────────────────────

export interface CommunityPost {
  id: number;
  user_id: number;
  title: string;
  content?: string;
  post_type: 'discussion' | 'question' | 'experience' | 'advice';
  like_count?: number;
  comment_count?: number;
  is_pinned?: boolean;
  created_at: string;
  author_name?: string;
}

// ─── Doctors ──────────────────────────────────────────────────────────────

export interface DoctorProfile {
  id?: number;
  user_id: number;
  full_name: string;
  email: string;
  specialty: string;
  grade: 'intern' | 'resident' | 'specialist' | 'professor' | 'honorary';
  grade_level: 1 | 2 | 3 | 4 | 5;
  hospital?: string;
  license_number?: string;
  bio?: string;
  verified: boolean;
  verified_at?: string;
  total_points?: number;
  profile_picture_url?: string;
}

// ─── Points ───────────────────────────────────────────────────────────────

export interface PointsLeader {
  id: number;
  full_name: string;
  email: string;
  role: string;
  total_points: number;
  doctor_grade?: string;
  doctor_specialty?: string;
  profile_picture_url?: string;
}

export interface PointHistory {
  id: number;
  points: number;
  reason: string;
  description?: string;
  reference_type?: string;
  created_at: string;
}

// ─── Calorie / Nutrition ──────────────────────────────────────────────────

export interface Food {
  id: number;
  name: string;
  name_ko: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
  sodium_per_100g: number;
  calcium_per_100g: number;
  iron_per_100g: number;
  is_baby_food: boolean;
  min_age_months: number | null;
  allergens: string[];
}

export interface CalorieRecommendation {
  id: number;
  age_min_months: number;
  age_max_months: number;
  gender: string;
  kcal_per_day: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  calcium_mg: number;
  iron_mg: number;
  label: string;
}

export interface DailyAnalysis {
  date: string;
  baby_id: number | null;
  recommendation: CalorieRecommendation | null;
  summary: {
    total_calories: number;
    total_protein: number;
    total_fat: number;
    total_carbs: number;
    total_fiber: number;
    total_calcium: number;
    total_iron: number;
  };
  intake_rate: {
    calories_pct: number;
    protein_pct: number;
    fat_pct: number;
    carbs_pct: number;
  };
  meal_breakdown: {
    meal_type: string;
    meal_label: string;
    total_calories: number;
    total_protein: number;
    total_fat: number;
    total_carbs: number;
    item_count: number;
  }[];
  per_food_detail: {
    id: number;
    food_id: number;
    food_name: string;
    food_name_ko: string;
    meal_type: string;
    meal_label: string;
    amount_g: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    calcium: number;
    iron: number;
    calories_pct_of_day: number;
    notes?: string;
  }[];
  alerts: string[];
}
