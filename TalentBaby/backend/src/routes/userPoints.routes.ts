import { Router } from 'express';
import { UserArticleController } from '../controllers/userArticle.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new UserArticleController();

// GET /api/v1/user-points             — my points balance + history
// GET /api/v1/user-points/leaderboard — top user rankings

router.get('/leaderboard', authenticate, c.getLeaderboard.bind(c));
router.get('/',            authenticate, c.getMyPoints.bind(c));

export default router;
