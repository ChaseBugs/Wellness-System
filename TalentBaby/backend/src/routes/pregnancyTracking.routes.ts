import { Router } from 'express';
import { PregnancyTrackingController } from '../controllers/pregnancyTracking.controller';
import { PregnancyWeekController } from '../controllers/pregnancyWeek.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadImage } from '../utils/fileUpload';

const router = Router();
const controller = new PregnancyTrackingController();
const weekController = new PregnancyWeekController();

// Week-by-week content (mirrors /pregnancy-weeks routes at the /pregnancy-tracking path)
router.get('/week/:week', authenticate, (req, res, next) => {
  req.params.weekNumber = req.params.week;
  weekController.getWeekContent(req, res, next);
});
router.get('/current', authenticate, controller.getCurrentWeek.bind(controller));

// Bump Photos
router.get('/pregnancy/:pregnancyId/bump-photos', authenticate, controller.getBumpPhotos.bind(controller));
router.post('/bump-photo', authenticate, uploadImage.single('photo'), controller.uploadBumpPhoto.bind(controller));

// Symptoms
router.get('/pregnancy/:pregnancyId/symptoms', authenticate, controller.getSymptoms.bind(controller));
router.post('/symptom', authenticate, controller.createSymptom.bind(controller));

// Kick Sessions
router.get('/pregnancy/:pregnancyId/kick-sessions', authenticate, controller.getKickSessions.bind(controller));
router.post('/kick-session', authenticate, controller.createKickSession.bind(controller));

// Contractions
router.get('/pregnancy/:pregnancyId/contractions', authenticate, controller.getContractions.bind(controller));
router.post('/contraction', authenticate, controller.createContraction.bind(controller));
router.get('/pregnancy/:pregnancyId/contraction-patterns', authenticate, controller.getContractionPatterns.bind(controller));

// Appointments
router.get('/appointments', authenticate, controller.getAppointments.bind(controller));
router.post('/appointment', authenticate, controller.createAppointment.bind(controller));
router.put('/appointment/:id', authenticate, controller.updateAppointment.bind(controller));
router.delete('/appointment/:id', authenticate, controller.deleteAppointment.bind(controller));

export default router;
