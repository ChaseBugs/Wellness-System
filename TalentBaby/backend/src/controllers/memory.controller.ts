import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { database } from '../config/database';

export class MemoryController {
  async getMemories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        'SELECT * FROM memories WHERE baby_id = $1 ORDER BY memory_date DESC',
        [babyId]
      );
      res.status(200).json({ message: 'Memories retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async createMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { baby_id, memory_type, title, description, media_url, memory_date, tags } = req.body;
      const result = await database.query(
        `INSERT INTO memories (baby_id, memory_type, title, description, media_url, memory_date, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [baby_id, memory_type, title, description, media_url, memory_date, tags || []]
      );
      res.status(201).json({ message: 'Memory created', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async getMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await database.query('SELECT * FROM memories WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }
      res.status(200).json({ message: 'Memory retrieved', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async updateMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { title, description, tags } = req.body;
      const result = await database.query(
        `UPDATE memories SET title = $1, description = $2, tags = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [title, description, tags, id]
      );
      res.status(200).json({ message: 'Memory updated', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async deleteMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await database.query('DELETE FROM memories WHERE id = $1', [id]);
      res.status(200).json({ message: 'Memory deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        `SELECT * FROM memories WHERE baby_id = $1 
         ORDER BY memory_date ASC, created_at ASC`,
        [babyId]
      );
      res.status(200).json({ message: 'Timeline retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }
}
