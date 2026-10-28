import { Router } from 'express';
import { RegistryController } from '../controllers/registry.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const registryController = new RegistryController();

router.get('/', authenticate, registryController.getRegistries.bind(registryController));
router.get('/:id', authenticate, registryController.getRegistry.bind(registryController));
router.get('/share/:shareCode', registryController.getRegistryByShareCode.bind(registryController));
router.post('/', authenticate, registryController.createRegistry.bind(registryController));
router.put('/:id', authenticate, registryController.updateRegistry.bind(registryController));
router.delete('/:id', authenticate, registryController.deleteRegistry.bind(registryController));

router.get('/:registryId/items', authenticate, registryController.getRegistryItems.bind(registryController));
router.post('/items', authenticate, registryController.addRegistryItem.bind(registryController));
router.put('/items/:itemId', authenticate, registryController.updateRegistryItem.bind(registryController));
router.delete('/:registryId/items/:itemId', authenticate, registryController.deleteRegistryItem.bind(registryController));

export default router;
