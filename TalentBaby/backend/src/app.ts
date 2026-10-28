import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { database } from './config/database';
import { prisma } from './config/prisma';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Talent Baby API',
      version: '1.0.0',
      description: 'API for baby growth tracking and talent development application',
      contact: {
        name: 'Talent Baby Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (activity thumbnails, etc.)
// Set Cross-Origin-Resource-Policy: cross-origin so the web-admin on a
// different port can load images (Helmet defaults to same-origin).
app.use('/images', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '..', 'public', 'images')));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Talent Baby API is running' });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import babyRoutes from './routes/baby.routes';
import growthRoutes from './routes/growth.routes';
import milestoneRoutes from './routes/milestone.routes';
import talentRoutes from './routes/talent.routes';
import activityRoutes from './routes/activity.routes';
import materialRoutes from './routes/material.routes';
import memoryRoutes from './routes/memory.routes';
import feedingRoutes from './routes/feeding.routes';
import sleepRoutes from './routes/sleep.routes';
import diaperRoutes from './routes/diaper.routes';
import videoRoutes from './routes/video.routes';
import dailyPlanRoutes from './routes/dailyPlan.routes';
import dailyUpdateRoutes from './routes/dailyUpdate.routes';
import pregnancyRoutes from './routes/pregnancy.routes';
import calculatorRoutes from './routes/calculator.routes';
import reminderRoutes from './routes/reminder.routes';
import pregnancyTrackingRoutes from './routes/pregnancyTracking.routes';
import articleRoutes from './routes/article.routes';
import expertClassRoutes from './routes/expertClass.routes';
import communityRoutes from './routes/community.routes';
import registryRoutes from './routes/registry.routes';
import reportRoutes from './routes/report.routes';
import userActionLogRoutes from './routes/userActionLog.routes';
import pregnancyWeekRoutes from './routes/pregnancyWeek.routes';
import videoShareRoutes from './routes/videoShare.routes';
import videoTagRoutes from './routes/videoTag.routes';
import workoutRoutes from './routes/workout.routes';
import nutritionRoutes from './routes/nutrition.routes';
import checklistRoutes from './routes/checklist.routes';
import birthPlanRoutes from './routes/birthPlan.routes';
import subscriptionRoutes from './routes/subscription.routes';
import aiInsightRoutes from './routes/aiInsight.routes';
import advancedAnalyticsRoutes from './routes/advancedAnalytics.routes';
import dataSyncRoutes from './routes/dataSync.routes';
import profileRoutes from './routes/profile.routes';
import activityMilestoneRoutes from './routes/activityMilestone.routes';
import talentAnalysisRoutes from './routes/talentAnalysis.routes';
import recipeRoutes from './routes/recipe.routes';
import guideRoutes from './routes/guide.routes';
import storyRoutes from './routes/story.routes';
import contentTopicRoutes from './routes/contentTopic.routes';
import userArticleRoutes from './routes/userArticle.routes';
import userPointsRoutes from './routes/userPoints.routes';
import doctorProfileRoutes from './routes/doctorProfile.routes';
import calorieRoutes from './routes/calorie.routes';
import familySharingRoutes from './routes/familySharing.routes';
import nameGeneratorRoutes from './routes/nameGenerator.routes';
import nutritionBenefitsRoutes from './routes/nutritionBenefits.routes';
import milestoneDefinitionRoutes from './routes/milestoneDefinition.routes';
import babyMilestoneRoutes from './routes/babyMilestone.routes';
import adminMessageRoutes from './routes/adminMessage.routes';
import contentSyncRoutes from './routes/contentSync.routes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/babies', babyRoutes);
app.use('/api/v1/growth', growthRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/talents', talentRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/memories', memoryRoutes);
app.use('/api/v1/feeding', feedingRoutes);
app.use('/api/v1/sleep', sleepRoutes);
app.use('/api/v1/diaper', diaperRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/daily-plan', dailyPlanRoutes);
app.use('/api/v1/daily-updates', dailyUpdateRoutes);
app.use('/api/v1/pregnancy', pregnancyRoutes);
app.use('/api/v1/pregnancy-tracking', pregnancyTrackingRoutes);
app.use('/api/v1/calculators', calculatorRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/expert-classes', expertClassRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/registry', registryRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/user-action-logs', userActionLogRoutes);
app.use('/api/v1/pregnancy-weeks', pregnancyWeekRoutes);
app.use('/api/v1/video-share', videoShareRoutes);
app.use('/api/v1/video-tags', videoTagRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/checklists', checklistRoutes);
app.use('/api/v1/birth-plans', birthPlanRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/ai-insights', aiInsightRoutes);
app.use('/api/v1/analytics', advancedAnalyticsRoutes);
app.use('/api/v1/sync', dataSyncRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/activity-milestones', activityMilestoneRoutes);
app.use('/api/v1/talent-analysis', talentAnalysisRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/guides', guideRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/content', contentTopicRoutes);
app.use('/api/v1/user-articles', userArticleRoutes);
app.use('/api/v1/user-points', userPointsRoutes);
app.use('/api/v1/doctors', doctorProfileRoutes);
app.use('/api/v1/calorie', calorieRoutes);
app.use('/api/v1/family', familySharingRoutes);
app.use('/api/v1/names', nameGeneratorRoutes);
app.use('/api/v1/nutrition', nutritionBenefitsRoutes);
app.use('/api/v1/milestone-definitions', milestoneDefinitionRoutes);
app.use('/api/v1/baby-milestones', babyMilestoneRoutes);
app.use('/api/v1/admin-messages', adminMessageRoutes);
app.use('/api/v1/content-sync', contentSyncRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await database.initialize();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  await database.close();
  process.exit(0);
});

startServer();

export default app;
