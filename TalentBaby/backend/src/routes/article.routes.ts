import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const articleController = new ArticleController();

// Mobile: age-range filtering (must be before /:id)
router.get('/age-range', authenticate, articleController.getArticlesByAgeRange.bind(articleController));
router.get('/search', authenticate, articleController.searchArticles.bind(articleController));
router.get('/bookmarked', authenticate, articleController.getBookmarkedArticles.bind(articleController));
router.get('/bookmarks/list', authenticate, articleController.getBookmarkedArticles.bind(articleController));

// CRUD
router.get('/', authenticate, articleController.getArticles.bind(articleController));
router.post('/', authenticate, articleController.createArticle.bind(articleController));
router.get('/:id', authenticate, articleController.getArticle.bind(articleController));
router.put('/:id', authenticate, articleController.updateArticle.bind(articleController));
router.delete('/:id', authenticate, articleController.deleteArticle.bind(articleController));

// Bookmarks
router.post('/:id/bookmark', authenticate, articleController.bookmarkArticle.bind(articleController));
router.delete('/:id/bookmark', authenticate, articleController.unbookmarkArticle.bind(articleController));

export default router;
