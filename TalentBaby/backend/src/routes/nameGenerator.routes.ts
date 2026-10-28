import { Router } from 'express';
import { NameGeneratorController } from '../controllers/nameGenerator.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new NameGeneratorController();

// GET /api/v1/names           — generate names (?gender=male&origin=korean&meaning=brave&limit=10)
// GET /api/v1/names/search    — search names (?q=min&limit=20)
// GET /api/v1/names/popular   — popular names (?gender=female&limit=10)

router.get('/search',  authenticate, c.searchNames.bind(c));
router.get('/popular', authenticate, c.getPopularNames.bind(c));
router.get('/',        authenticate, c.generateNames.bind(c));

export default router;
