import { Router } from 'express';
import { UserArticleController } from '../controllers/userArticle.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new UserArticleController();

// ─── User Articles ────────────────────────────────────────────────────────────
// GET  /api/v1/user-articles             — list (public)
// POST /api/v1/user-articles             — submit article (+10 pts)
// GET  /api/v1/user-articles/:id         — article detail
// PUT  /api/v1/user-articles/:id         — update (author only)
// DELETE /api/v1/user-articles/:id       — delete (author only)
// POST /api/v1/user-articles/:id/like    — toggle like

router.get('/',    authenticate, c.getArticles.bind(c));
router.post('/',   authenticate, c.submitArticle.bind(c));
router.get('/:id', authenticate, c.getArticle.bind(c));
router.put('/:id', authenticate, c.updateArticle.bind(c));
router.delete('/:id', authenticate, c.deleteArticle.bind(c));
router.post('/:id/like', authenticate, c.toggleLike.bind(c));

// ─── Comments / Replies ───────────────────────────────────────────────────────
// GET  /api/v1/user-articles/:id/comments              — nested comment list
// POST /api/v1/user-articles/:id/comments              — post comment (+3 pts / doctor +5 pts)
// DELETE /api/v1/user-articles/:id/comments/:commentId — delete comment
// POST /api/v1/user-articles/:id/comments/:commentId/like — toggle comment like

router.get('/:id/comments',    authenticate, c.getComments.bind(c));
router.post('/:id/comments',   authenticate, c.postComment.bind(c));
router.delete('/:id/comments/:commentId', authenticate, c.deleteComment.bind(c));
router.post('/:id/comments/:commentId/like', authenticate, c.toggleCommentLike.bind(c));

export default router;
