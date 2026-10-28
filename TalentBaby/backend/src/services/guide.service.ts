import { GuideRepository } from '../repositories/guide.repository';
import { FeedingRepository } from '../repositories/feeding.repository';
import { GrowthRepository } from '../repositories/growth.repository';
import { database } from '../config/database';

export class GuideService {
  private guideRepository: GuideRepository;
  private feedingRepository: FeedingRepository;
  private growthRepository: GrowthRepository;

  constructor() {
    this.guideRepository = new GuideRepository();
    this.feedingRepository = new FeedingRepository();
    this.growthRepository = new GrowthRepository();
  }

  // Sleep Guide Methods
  async getSleepGuide(ageMonths: number) {
    return await this.guideRepository.getSleepGuideByAge(ageMonths);
  }

  async getAllSleepGuides() {
    return await this.guideRepository.getAllSleepGuides();
  }

  async getSleepTips(ageMonths: number) {
    return await this.guideRepository.getSleepTipsByAge(ageMonths);
  }

  async getSleepSchedule(ageMonths: number) {
    return await this.guideRepository.getSleepScheduleRecommendations(ageMonths);
  }

  // Feeding Guide Methods
  async getFeedingGuide(ageMonths: number) {
    return await this.guideRepository.getFeedingGuideByAge(ageMonths);
  }

  async getAllFeedingGuides() {
    return await this.guideRepository.getAllFeedingGuides();
  }

  async getFeedingTips(ageMonths: number) {
    return await this.guideRepository.getFeedingTipsByAge(ageMonths);
  }

  async getFeedingSchedule(ageMonths: number) {
    return await this.guideRepository.getFeedingScheduleRecommendations(ageMonths);
  }

  async getFoodIntroductionTimeline(ageMonths: number) {
    return await this.guideRepository.getFoodIntroductionTimeline(ageMonths);
  }

  async getFeedingAdequacyAssessment(babyId: number, ageMonths: number) {
    // Get feeding data
    const feedings = await this.feedingRepository.findByBabyId(babyId);
    
    // Get growth data
    const growthRecords = await this.growthRepository.findByBabyId(babyId);
    const latestGrowth = growthRecords[0];

    // Get assessment questions
    const questions = await this.guideRepository.getFeedingAdequacyQuestions(ageMonths);

    // Calculate feeding statistics
    const recentFeedings = feedings.filter(
      (f: any) => new Date(f.feeding_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const totalAmount = recentFeedings.reduce((sum: number, f: any) => sum + (f.amount_ml || 0), 0);
    const avgDailyAmount = totalAmount / 7;
    const feedingFrequency = recentFeedings.length / 7;

    // Assess adequacy
    const assessment = {
      questions,
      feedingStats: {
        averageDailyAmount: avgDailyAmount,
        feedingFrequency: feedingFrequency,
        recentFeedingsCount: recentFeedings.length,
      },
      growthData: latestGrowth ? {
        weight: latestGrowth.weight_kg,
        height: latestGrowth.height_cm,
        percentiles: {
          weight: latestGrowth.percentile_weight,
          height: latestGrowth.percentile_height,
        },
      } : null,
      recommendations: this.generateFeedingRecommendations(ageMonths, avgDailyAmount, feedingFrequency, latestGrowth),
    };

    return assessment;
  }

  private generateFeedingRecommendations(
    ageMonths: number,
    avgDailyAmount: number,
    feedingFrequency: number,
    latestGrowth: any
  ): string[] {
    const recommendations: string[] = [];

    // Age-based recommendations
    if (ageMonths < 6) {
      if (avgDailyAmount < 500) {
        recommendations.push('Consider increasing feeding frequency or amount');
      }
      if (feedingFrequency < 6) {
        recommendations.push('Newborns typically need 8-12 feedings per day');
      }
    } else if (ageMonths >= 6 && ageMonths < 12) {
      if (avgDailyAmount < 600) {
        recommendations.push('Ensure adequate milk/formula intake alongside solid foods');
      }
      recommendations.push('Introduce a variety of solid foods gradually');
    }

    // Growth-based recommendations
    if (latestGrowth) {
      if (latestGrowth.percentile_weight < 25) {
        recommendations.push('Monitor weight gain closely and consult pediatrician if concerned');
      }
      if (latestGrowth.percentile_height < 25) {
        recommendations.push('Ensure adequate nutrition for healthy growth');
      }
    }

    return recommendations;
  }
}
