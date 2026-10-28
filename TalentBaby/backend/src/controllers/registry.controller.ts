import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { RegistryService } from '../services/registry.service';
import { logger } from '../utils/logger';

export class RegistryController {
  private registryService: RegistryService;

  constructor() {
    this.registryService = new RegistryService();
  }

  async getRegistries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registries = await this.registryService.getRegistries(userId);

      res.status(200).json({
        message: 'Registries retrieved successfully',
        data: registries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRegistry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registryId = parseInt(req.params.id, 10);
      const registry = await this.registryService.getRegistry(registryId, userId);

      res.status(200).json({
        message: 'Registry retrieved successfully',
        data: registry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRegistryByShareCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const shareCode = req.params.shareCode;
      const registry = await this.registryService.getRegistryByShareCode(shareCode);

      res.status(200).json({
        message: 'Registry retrieved successfully',
        data: registry,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRegistry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registry = await this.registryService.createRegistry(userId, req.body);

      logger.info('Registry created', { userId, registryId: registry.id });

      res.status(201).json({
        message: 'Registry created successfully',
        data: registry,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRegistry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registryId = parseInt(req.params.id, 10);
      const registry = await this.registryService.updateRegistry(registryId, userId, req.body);

      res.status(200).json({
        message: 'Registry updated successfully',
        data: registry,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRegistry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registryId = parseInt(req.params.id, 10);
      await this.registryService.deleteRegistry(registryId, userId);

      res.status(200).json({
        message: 'Registry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getRegistryItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registryId = parseInt(req.params.registryId, 10);
      const items = await this.registryService.getRegistryItems(registryId, userId);

      res.status(200).json({
        message: 'Registry items retrieved successfully',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  async addRegistryItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const registryId = parseInt(req.body.registry_id, 10);
      const item = await this.registryService.addRegistryItem(registryId, userId, req.body);

      res.status(201).json({
        message: 'Registry item added successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRegistryItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const itemId = parseInt(req.params.itemId, 10);
      const registryId = parseInt(req.body.registry_id, 10);
      const item = await this.registryService.updateRegistryItem(itemId, userId, {
        ...req.body,
        registry_id: registryId,
      });

      res.status(200).json({
        message: 'Registry item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRegistryItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const itemId = parseInt(req.params.itemId, 10);
      const registryId = parseInt(req.params.registryId, 10);
      await this.registryService.deleteRegistryItem(itemId, registryId, userId);

      res.status(200).json({
        message: 'Registry item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
