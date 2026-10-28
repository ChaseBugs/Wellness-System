import { prisma } from '../config/prisma';

export class GuideRepository {
  // Sleep Guide Methods
  async getSleepGuideByAge(ageMonths: number) {
    const row = await prisma.sleep_guides.findFirst({
      where: {
        age_min_months: { lte: ageMonths },
        OR: [{ age_max_months: null }, { age_max_months: { gte: ageMonths } }],
      },
      orderBy: { age_min_months: 'desc' },
    });
    return row || null;
  }

  async getAllSleepGuides() {
    return prisma.sleep_guides.findMany({
      orderBy: { age_min_months: 'asc' },
    });
  }

  async getSleepTipsByAge(ageMonths: number) {
    const guide = await this.getSleepGuideByAge(ageMonths);
    return guide?.tips || [];
  }

  async getSleepScheduleRecommendations(ageMonths: number) {
    const guide = await this.getSleepGuideByAge(ageMonths);
    return guide?.schedule_recommendations || null;
  }

  // Feeding Guide Methods
  async getFeedingGuideByAge(ageMonths: number) {
    const row = await prisma.feeding_guides.findFirst({
      where: {
        age_min_months: { lte: ageMonths },
        OR: [{ age_max_months: null }, { age_max_months: { gte: ageMonths } }],
      },
      orderBy: { age_min_months: 'desc' },
    });
    return row || null;
  }

  async getAllFeedingGuides() {
    return prisma.feeding_guides.findMany({
      orderBy: { age_min_months: 'asc' },
    });
  }

  async getFeedingTipsByAge(ageMonths: number) {
    const guide = await this.getFeedingGuideByAge(ageMonths);
    return guide?.tips || [];
  }

  async getFeedingScheduleRecommendations(ageMonths: number) {
    const guide = await this.getFeedingGuideByAge(ageMonths);
    return guide?.schedule_recommendations || null;
  }

  async getFoodIntroductionTimeline(ageMonths: number) {
    const guide = await this.getFeedingGuideByAge(ageMonths);
    return guide?.food_introduction_timeline || null;
  }

  async getFeedingAdequacyQuestions(ageMonths: number) {
    const guide = await this.getFeedingGuideByAge(ageMonths);
    return guide?.adequacy_assessment_questions || null;
  }
}
