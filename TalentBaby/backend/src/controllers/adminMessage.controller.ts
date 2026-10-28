import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AdminMessageService } from '../services/adminMessage.service';

export class AdminMessageController {
  private service: AdminMessageService;

  constructor() {
    this.service = new AdminMessageService();
  }

  // GET /admin-messages — all messages (admin only)
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await this.service.getAll();
      res.json({ success: true, data: messages });
    } catch (err) { next(err); }
  }

  // GET /admin-messages/published — published messages for mobile users
  async getPublished(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = (req as any).userRole as string | undefined;
      const messages = await this.service.getPublished(role);
      res.json({ success: true, data: messages });
    } catch (err) { next(err); }
  }

  // GET /admin-messages/:id
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const msg = await this.service.getById(Number(req.params.id));
      res.json({ success: true, data: msg });
    } catch (err) { next(err); }
  }

  // POST /admin-messages
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, body, type, priority, target_role, is_published } = req.body;
      if (!title?.trim() || !body?.trim()) {
        res.status(400).json({ success: false, error: 'title and body are required' });
        return;
      }
      const msg = await this.service.create({
        title: title.trim(),
        body: body.trim(),
        type: type ?? 'announcement',
        priority: priority ?? 'normal',
        target_role: target_role ?? 'all',
        is_published: is_published ?? false,
        published_at: is_published ? new Date().toISOString() : null,
      });
      res.status(201).json({ success: true, data: msg });
    } catch (err) { next(err); }
  }

  // PUT /admin-messages/:id
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const msg = await this.service.update(Number(req.params.id), req.body);
      res.json({ success: true, data: msg });
    } catch (err) { next(err); }
  }

  // DELETE /admin-messages/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.delete(Number(req.params.id));
      res.json({ success: true, message: 'Message deleted' });
    } catch (err) { next(err); }
  }
}
