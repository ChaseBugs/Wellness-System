import type { ContentItem } from "../../../platform/content/models/content-item.js";
import type { ArticleCatalog, IHeightCatalogRepository } from "../domain/height-ports.js";
import type { Banner, CatalogArticle, CatalogExercise, CatalogPlan, HomeResponse } from "../models/height-catalog.js";

const APP = "height-increase";
const LIST_LIMIT = 100;
const str = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

/** Public HeightIncrease catalog: usable before sign-up, like the legacy mobile API. */
export class HeightCatalogService {
  constructor(
    private catalog: IHeightCatalogRepository,
    private articles: ArticleCatalog
  ) {}

  async home(): Promise<HomeResponse> {
    const [banners, plans, articles] = await Promise.all([
      this.catalog.activeBanners(),
      this.catalog.publishedPlans({ limit: 5 }),
      this.listArticles({ limit: 8, featuredFirst: true })
    ]);
    return {
      cards: { myTraining: plans.find((plan) => plan.type === "featured") ?? plans[0] ?? null, more: articles.slice(0, 4) },
      banners,
      articles
    };
  }

  exercises(filters: { category?: string; level?: string }): Promise<CatalogExercise[]> {
    return this.catalog.publishedExercises(filters);
  }

  /** Summaries; a plan's steps and session tracking come from GET /routines/:id and /sessions. */
  trainingPlans(filters: { type?: string; level?: string }): Promise<CatalogPlan[]> {
    return this.catalog.publishedPlans({ ...filters, limit: LIST_LIMIT });
  }

  banners(placement?: string): Promise<Banner[]> {
    return this.catalog.activeBanners(placement);
  }

  articlesList(category?: string): Promise<CatalogArticle[]> {
    return this.listArticles({ category, limit: LIST_LIMIT });
  }

  private async listArticles(options: { category?: string; limit: number; featuredFirst?: boolean }): Promise<CatalogArticle[]> {
    const { items } = await this.articles.listPublishedItems({
      appCode: APP,
      contentType: "article",
      category: options.category,
      sort: "recent",
      page: 1,
      limit: options.limit,
      offset: 0
    });
    const articles = items.map(toArticle);
    return options.featuredFirst ? [...articles].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)) : articles;
  }
}

function toArticle(item: ContentItem): CatalogArticle {
  const a = item.attributes;
  return {
    id: item.id,
    title: item.title,
    slug: str(a.slug),
    category: item.category,
    excerpt: item.summary,
    body: item.body,
    imageUrl: str(item.media.imageUrl),
    authorName: str(a.author),
    readMinutes: item.durationMinutes,
    tags: item.tags,
    isFeatured: a.isFeatured === true,
    expertReviewed: item.expertReviewed,
    publishedAt: item.publishedAt
  };
}
