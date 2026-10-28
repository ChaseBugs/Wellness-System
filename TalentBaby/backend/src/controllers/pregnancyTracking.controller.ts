import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BumpPhotoRepository } from '../repositories/bumpPhoto.repository';
import { SymptomRepository } from '../repositories/symptom.repository';
import { KickSessionRepository } from '../repositories/kickSession.repository';
import { ContractionRepository } from '../repositories/contraction.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class PregnancyTrackingController {
  private bumpPhotoRepository: BumpPhotoRepository;
  private symptomRepository: SymptomRepository;
  private kickSessionRepository: KickSessionRepository;
  private contractionRepository: ContractionRepository;
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.bumpPhotoRepository = new BumpPhotoRepository();
    this.symptomRepository = new SymptomRepository();
    this.kickSessionRepository = new KickSessionRepository();
    this.contractionRepository = new ContractionRepository();
    this.appointmentRepository = new AppointmentRepository();
  }

  // Bump Photos
  async getBumpPhotos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const photos = await this.bumpPhotoRepository.findByPregnancyId(pregnancyId);
      res.status(200).json({ message: 'Bump photos retrieved', data: photos });
    } catch (error) {
      next(error);
    }
  }

  async uploadBumpPhoto(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.body.pregnancy_id, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const photo = await this.bumpPhotoRepository.create({
        pregnancy_id: pregnancyId,
        photo_url: `/uploads/${file.filename}`,
        week_number: parseInt(req.body.week_number, 10),
        photo_date: req.body.photo_date ? new Date(req.body.photo_date) : new Date(),
        notes: req.body.notes,
      });

      res.status(201).json({ message: 'Bump photo uploaded', data: photo });
    } catch (error) {
      next(error);
    }
  }

  // Symptoms
  async getSymptoms(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const symptoms = await this.symptomRepository.findByPregnancyId(pregnancyId, startDate, endDate);
      res.status(200).json({ message: 'Symptoms retrieved', data: symptoms });
    } catch (error) {
      next(error);
    }
  }

  async createSymptom(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.body.pregnancy_id, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const symptom = await this.symptomRepository.create(req.body);
      res.status(201).json({ message: 'Symptom logged', data: symptom });
    } catch (error) {
      next(error);
    }
  }

  // Kick Sessions
  async getKickSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const sessions = await this.kickSessionRepository.findByPregnancyId(pregnancyId);
      res.status(200).json({ message: 'Kick sessions retrieved', data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async createKickSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.body.pregnancy_id, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const session = await this.kickSessionRepository.create(req.body);
      res.status(201).json({ message: 'Kick session created', data: session });
    } catch (error) {
      next(error);
    }
  }

  // Contractions
  async getContractions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const contractions = await this.contractionRepository.findByPregnancyId(pregnancyId);
      res.status(200).json({ message: 'Contractions retrieved', data: contractions });
    } catch (error) {
      next(error);
    }
  }

  async createContraction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.body.pregnancy_id, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const contraction = await this.contractionRepository.create(req.body);
      res.status(201).json({ message: 'Contraction logged', data: contraction });
    } catch (error) {
      next(error);
    }
  }

  async getContractionPatterns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId, 10);
      await this.verifyPregnancyOwnership(pregnancyId, req.userId!);

      const patterns = await this.contractionRepository.getContractionPatterns(pregnancyId);
      res.status(200).json({ message: 'Contraction patterns retrieved', data: patterns });
    } catch (error) {
      next(error);
    }
  }

  // Appointments
  async getAppointments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const appointments = await this.appointmentRepository.findByUserId(userId, startDate, endDate);
      res.status(200).json({ message: 'Appointments retrieved', data: appointments });
    } catch (error) {
      next(error);
    }
  }

  async createAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const appointment = await this.appointmentRepository.create({
        ...req.body,
        user_id: userId,
      });

      logger.info('Appointment created', { userId, appointmentId: appointment.id });
      res.status(201).json({ message: 'Appointment created', data: appointment });
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const appointmentId = parseInt(req.params.id, 10);
      const appointment = await this.appointmentRepository.update(appointmentId, userId, req.body);

      res.status(200).json({ message: 'Appointment updated', data: appointment });
    } catch (error) {
      next(error);
    }
  }

  async deleteAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const appointmentId = parseInt(req.params.id, 10);
      await this.appointmentRepository.delete(appointmentId, userId);

      res.status(200).json({ message: 'Appointment deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentWeek(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const pregnancyResult = await database.query(
        'SELECT * FROM pregnancies WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (pregnancyResult.rows.length === 0) {
        res.status(404).json({ error: 'No active pregnancy found' });
        return;
      }

      const pregnancy = pregnancyResult.rows[0];
      const today = new Date();
      const lmpDate = pregnancy.lmp_date ? new Date(pregnancy.lmp_date) : null;
      let currentWeek = pregnancy.current_week;

      if (!currentWeek && lmpDate) {
        const daysSinceLmp = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
        currentWeek = Math.floor(daysSinceLmp / 7);
      }

      res.status(200).json({
        message: 'Current pregnancy week retrieved successfully',
        data: {
          current_week: currentWeek,
          due_date: pregnancy.due_date,
          pregnancy_id: pregnancy.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private async verifyPregnancyOwnership(pregnancyId: number, userId: number): Promise<void> {
    const result = await database.query(
      'SELECT id FROM pregnancies WHERE id = $1 AND user_id = $2',
      [pregnancyId, userId]
    );
    if (result.rows.length === 0) {
      const error: AppError = new Error('Pregnancy not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
  }
}
