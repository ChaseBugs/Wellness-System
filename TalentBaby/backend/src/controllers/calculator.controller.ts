import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CalculatorService } from '../services/calculator.service';

export class CalculatorController {
  private calculatorService: CalculatorService;

  constructor() {
    this.calculatorService = new CalculatorService();
  }

  async calculateDueDate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lmp_date, conception_date, ultrasound_date, gestational_age_weeks } = req.body;

      let dueDate: Date;

      if (lmp_date) {
        dueDate = this.calculatorService.calculateDueDate(new Date(lmp_date));
      } else if (conception_date) {
        dueDate = this.calculatorService.calculateFromConception(new Date(conception_date));
      } else if (ultrasound_date && gestational_age_weeks) {
        dueDate = this.calculatorService.calculateFromUltrasound(
          new Date(ultrasound_date),
          gestational_age_weeks
        );
      } else {
        res.status(400).json({ error: 'Please provide LMP date, conception date, or ultrasound data' });
        return;
      }

      res.status(200).json({
        message: 'Due date calculated successfully',
        data: {
          due_date: dueDate,
          current_week: this.calculateCurrentWeek(dueDate),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateOvulation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { last_period_date, cycle_length } = req.body;

      if (!last_period_date) {
        res.status(400).json({ error: 'Last period date is required' });
        return;
      }

      const result = this.calculatorService.calculateOvulation(
        new Date(last_period_date),
        cycle_length || 28
      );

      res.status(200).json({
        message: 'Ovulation calculated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateWeightGain(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pre_pregnancy_weight, current_weight, current_week } = req.body;

      if (!pre_pregnancy_weight || !current_weight || !current_week) {
        res.status(400).json({ error: 'All parameters are required' });
        return;
      }

      const result = this.calculatorService.calculatePregnancyWeightGain(
        pre_pregnancy_weight,
        current_weight,
        current_week
      );

      res.status(200).json({
        message: 'Weight gain calculated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBabySizeComparison(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const week = parseInt(req.params.week, 10);

      if (week < 1 || week > 42) {
        res.status(400).json({ error: 'Week must be between 1 and 42' });
        return;
      }

      const result = this.calculatorService.getBabySizeComparison(week);

      res.status(200).json({
        message: 'Baby size comparison retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private calculateCurrentWeek(dueDate: Date): number {
    const today = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return 40 - Math.ceil(daysUntilDue / 7);
  }
}
