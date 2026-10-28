import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const subscriptionController = new SubscriptionController();

router.get('/', authenticate, subscriptionController.getSubscription.bind(subscriptionController));
router.get('/premium-status', authenticate, subscriptionController.checkPremiumStatus.bind(subscriptionController));
router.post('/', authenticate, subscriptionController.createSubscription.bind(subscriptionController));
router.put('/:id', authenticate, subscriptionController.updateSubscription.bind(subscriptionController));
router.post('/:id/cancel', authenticate, subscriptionController.cancelSubscription.bind(subscriptionController));

export default router;
