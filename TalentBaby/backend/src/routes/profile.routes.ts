import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const profileController = new ProfileController();

router.get('/', authenticate, profileController.getBabyProfiles.bind(profileController));
router.post('/switch', authenticate, profileController.switchActiveProfile.bind(profileController));
router.get('/baby/:babyId/data/:dataType', authenticate, profileController.getProfileSpecificData.bind(profileController));

export default router;
