import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const reminderController = new ReminderController();

router.get('/', authenticate, reminderController.getReminders.bind(reminderController));
router.get('/baby/:babyId', authenticate, reminderController.getBabyReminders.bind(reminderController));
router.post('/', authenticate, reminderController.createReminder.bind(reminderController));
router.put('/:id', authenticate, reminderController.updateReminder.bind(reminderController));
router.delete('/:id', authenticate, reminderController.deleteReminder.bind(reminderController));
router.get('/upcoming', authenticate, reminderController.getUpcomingReminders.bind(reminderController));

export default router;
