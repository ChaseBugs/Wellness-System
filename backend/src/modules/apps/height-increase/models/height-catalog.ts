/** Published HeightIncrease exercise from the Routine Engine, flattened with its app attributes. */
export interface CatalogExercise {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  durationSeconds: number | null;
  calories: number | null;
  difficulty: string;
  ageGroup: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  equipment: string[];
  targetAreas: string[];
  steps: string[];
  tips: string[];
  safetyNotes: string[];
  expertReviewed: boolean;
}

/** Published training plan summary (full steps: GET /routines/:id). */
export interface CatalogPlan {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: string;
  type: string | null;
  bannerImageUrl: string | null;
  icon: string | null;
  estimatedMinutes: number | null;
  isPremium: boolean;
  stepCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  placement: string;
  imageUrl: string | null;
  icon: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  backgroundColor: string;
  priority: number;
}

export interface CatalogArticle {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  authorName: string | null;
  readMinutes: number | null;
  tags: string[];
  isFeatured: boolean;
  expertReviewed: boolean;
  publishedAt: Date | null;
}

export interface HomeResponse {
  cards: { myTraining: CatalogPlan | null; more: CatalogArticle[] };
  banners: Banner[];
  articles: CatalogArticle[];
}
