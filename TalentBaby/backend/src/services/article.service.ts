import { ArticleRepository, Article, CreateArticleInput } from '../repositories/article.repository';

export class ArticleService {
  private articleRepository: ArticleRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  async getArticles(category?: string, isFeatured?: boolean, limit?: number, offset?: number, lang?: string, month?: number): Promise<Article[]> {
    return await this.articleRepository.findAll(category, isFeatured, limit, offset, lang, month);
  }

  async getArticle(id: number, userId?: number): Promise<Article> {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new Error('Article not found');
    }

    await this.articleRepository.incrementViewCount(id);

    if (userId) {
      await this.articleRepository.recordReadingHistory(userId, id);
    }

    return article;
  }

  async createArticle(input: CreateArticleInput): Promise<Article> {
    return await this.articleRepository.create(input);
  }

  async updateArticle(id: number, input: Partial<CreateArticleInput>): Promise<Article> {
    const article = await this.articleRepository.update(id, input);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  async deleteArticle(id: number): Promise<void> {
    const deleted = await this.articleRepository.delete(id);
    if (!deleted) {
      throw new Error('Article not found');
    }
  }

  async getArticlesByAgeRange(ageMonths: number, category?: string, lang: string = 'en'): Promise<Article[]> {
    return await this.articleRepository.findByAgeRange(ageMonths, category, lang);
  }

  async searchArticles(searchTerm: string, limit: number = 20): Promise<Article[]> {
    return await this.articleRepository.search(searchTerm, limit);
  }

  async bookmarkArticle(userId: number, articleId: number): Promise<void> {
    await this.articleRepository.bookmarkArticle(userId, articleId);
  }

  async unbookmarkArticle(userId: number, articleId: number): Promise<void> {
    await this.articleRepository.unbookmarkArticle(userId, articleId);
  }

  async getBookmarkedArticles(userId: number): Promise<Article[]> {
    return await this.articleRepository.getBookmarkedArticles(userId);
  }
}
