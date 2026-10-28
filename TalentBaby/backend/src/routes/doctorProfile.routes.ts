import { Router } from 'express';
import { UserArticleController } from '../controllers/userArticle.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new UserArticleController();

// GET  /api/v1/doctors                  — list doctors (?specialty=pediatrics&grade_level=3)
// POST /api/v1/doctors                  — register/update doctor profile (self)
// GET  /api/v1/doctors/:userId          — specific doctor profile
// POST /api/v1/doctors/:userId/verify   — verify doctor (admin only)

router.get('/',    authenticate, c.getAllDoctors.bind(c));
router.post('/',   authenticate, c.registerDoctorProfile.bind(c));
router.get('/:userId',  authenticate, c.getDoctorProfile.bind(c));
router.post('/:userId/verify', authenticate, c.verifyDoctor.bind(c));

export default router;
