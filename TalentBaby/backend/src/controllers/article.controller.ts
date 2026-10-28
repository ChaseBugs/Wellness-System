import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ArticleService } from '../services/article.service';

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  async getArticles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const isFeatured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
      const lang = (req.query.lang as string) || req.headers['accept-language']?.slice(0, 2) || 'en';
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

      const articles = await this.articleService.getArticles(category, isFeatured, limit, offset, lang, month);

      res.status(200).json({ success: true, data: articles });
    } catch (error) {
      next(error);
    }
  }

  async getArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = parseInt(req.params.id, 10);
      const userId = req.userId;

      const article = await this.articleService.getArticle(articleId, userId);

      res.status(200).json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await this.articleService.createArticle(req.body);
      res.status(201).json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const article = await this.articleService.updateArticle(id, req.body);
      res.status(200).json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.articleService.deleteArticle(id);
      res.status(200).json({ success: true, message: 'Article deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getArticlesByAgeRange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = parseInt(req.query.age_months as string, 10);
      if (isNaN(ageMonths) || ageMonths < 0) {
        res.status(400).json({ success: false, error: 'age_months must be a non-negative integer' });
        return;
      }
      const category = req.query.category as string | undefined;
      const lang = (req.query.lang as string) || 'en';

      const articles = await this.articleService.getArticlesByAgeRange(ageMonths, category, lang);
      res.status(200).json({ success: true, data: articles });
    } catch (error) {
      next(error);
    }
  }

  async searchArticles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (!searchTerm) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const articles = await this.articleService.searchArticles(searchTerm, limit);
      res.status(200).json({ success: true, data: articles });
    } catch (error) {
      next(error);
    }
  }

  async bookmarkArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const articleId = parseInt(req.params.id, 10);
      await this.articleService.bookmarkArticle(userId, articleId);
      res.status(200).json({ success: true, message: 'Article bookmarked successfully' });
    } catch (error) {
      next(error);
    }
  }

  async unbookmarkArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const articleId = parseInt(req.params.id, 10);
      await this.articleService.unbookmarkArticle(userId, articleId);
      res.status(200).json({ success: true, message: 'Article unbookmarked successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarkedArticles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const articles = await this.articleService.getBookmarkedArticles(userId);
      res.status(200).json({ success: true, data: articles });
    } catch (error) {
      next(error);
    }
  }
}
