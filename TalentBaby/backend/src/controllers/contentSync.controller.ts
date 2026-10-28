import { Request, Response, NextFunction } from 'express';
import { ContentSyncService } from '../services/contentSync.service';

export class ContentSyncController {
  private service = new ContentSyncService();

  async getManifest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const manifest = await this.service.getManifest();
      res.status(200).json({ success: true, data: manifest });
    } catch (error) {
      next(error);
    }
  }

  async getDelta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const since = this.service.parseSince(req.query.since);
      const assetSince = this.service.parseSince(req.query.asset_since);
      const requestedTables = typeof req.query.tables === 'string'
        ? req.query.tables.split(',').map((table) => table.trim()).filter(Boolean)
        : undefined;
      const includeAssets = req.query.include_assets !== 'false';
      const delta = await this.service.getDelta(since, assetSince, requestedTables, includeAssets);
      res.status(200).json({ success: true, data: delta });
    } catch (error) {
      next(error);
    }
  }
}
