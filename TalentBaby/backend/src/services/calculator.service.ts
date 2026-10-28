import { AppError } from '../middleware/errorHandler';

export class CalculatorService {
  calculateDueDate(lmpDate: Date): Date {
    // Due date is 280 days (40 weeks) from LMP
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);
    return dueDate;
  }

  calculateFromConception(conceptionDate: Date): Date {
    // Due date is 266 days (38 weeks) from conception
    const dueDate = new Date(conceptionDate);
    dueDate.setDate(dueDate.getDate() + 266);
    return dueDate;
  }

  calculateFromUltrasound(ultrasoundDate: Date, gestationalAgeWeeks: number): Date {
    // Calculate due date based on ultrasound
    const dueDate = new Date(ultrasoundDate);
    const weeksRemaining = 40 - gestationalAgeWeeks;
    dueDate.setDate(dueDate.getDate() + weeksRemaining * 7);
    return dueDate;
  }

  calculateOvulation(lastPeriodDate: Date, cycleLength: number = 28): { ovulationDate: Date; fertileWindow: { start: Date; end: Date } } {
    // Ovulation typically occurs 14 days before next period
    const nextPeriod = new Date(lastPeriodDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    // Fertile window is typically 5 days before ovulation to 1 day after
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    return {
      ovulationDate,
      fertileWindow: {
        start: fertileStart,
        end: fertileEnd,
      },
    };
  }

  calculatePregnancyWeightGain(prePregnancyWeight: number, currentWeight: number, currentWeek: number): {
    currentGain: number;
    recommendedGain: number;
    status: string;
  } {
    const currentGain = currentWeight - prePregnancyWeight;

    // Recommended weight gain based on BMI (simplified)
    // Assuming normal BMI (18.5-24.9)
    let recommendedGain = 0;
    if (currentWeek <= 12) {
      recommendedGain = 1 - 2.5; // 1-2.5 kg in first trimester
    } else if (currentWeek <= 28) {
      recommendedGain = 0.5 * (currentWeek - 12) + 2.5; // 0.5 kg per week in second trimester
    } else {
      recommendedGain = 0.5 * (currentWeek - 12) + 2.5; // Continue 0.5 kg per week
    }

    let status = 'normal';
    if (currentGain < recommendedGain * 0.8) {
      status = 'below_recommended';
    } else if (currentGain > recommendedGain * 1.2) {
      status = 'above_recommended';
    }

    return {
      currentGain,
      recommendedGain,
      status,
    };
  }

  getBabySizeComparison(week: number): { size: string; weight: string; length: string } {
    // Simplified baby size comparison (fruit/vegetable)
    const sizeComparisons: { [key: number]: { size: string; weight: string; length: string } } = {
      8: { size: 'Raspberry', weight: '1g', length: '1.6cm' },
      12: { size: 'Lime', weight: '14g', length: '5.4cm' },
      16: { size: 'Avocado', weight: '100g', length: '11.6cm' },
      20: { size: 'Banana', weight: '300g', length: '16.4cm' },
      24: { size: 'Corn', weight: '600g', length: '30cm' },
      28: { size: 'Eggplant', weight: '1000g', length: '37.6cm' },
      32: { size: 'Squash', weight: '1700g', length: '42.4cm' },
      36: { size: 'Romaine Lettuce', weight: '2600g', length: '47.4cm' },
      40: { size: 'Small Pumpkin', weight: '3400g', length: '51.2cm' },
    };

    // Find closest week
    const weeks = Object.keys(sizeComparisons).map(Number).sort((a, b) => a - b);
    const closestWeek = weeks.reduce((prev, curr) => 
      Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
    );

    return sizeComparisons[closestWeek] || { size: 'Unknown', weight: 'Unknown', length: 'Unknown' };
  }
}
