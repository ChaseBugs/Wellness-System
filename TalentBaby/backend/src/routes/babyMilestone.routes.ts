import { Router } from 'express';
import { BabyMilestoneController } from '../controllers/babyMilestone.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new BabyMilestoneController();

/**
 * @swagger
 * tags:
 *   name: BabyMilestones
 *   description: Track which milestones a baby has achieved
 */

/**
 * @swagger
 * /api/v1/baby-milestones/{babyId}:
 *   get:
 *     summary: Get all milestone records for a baby
 *     tags: [BabyMilestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: babyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by milestone month
 *     responses:
 *       200:
 *         description: Baby milestone records
 */
router.get('/:babyId', authenticate, ctrl.getForBaby.bind(ctrl));

/**
 * @swagger
 * /api/v1/baby-milestones/{babyId}/report:
 *   get:
 *     summary: Generate milestone progress report for a baby
 *     tags: [BabyMilestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: babyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Report for a specific month (defaults to baby's current age month)
 *     responses:
 *       200:
 *         description: Milestone report with completion counts per type
 */
router.get('/:babyId/report', authenticate, ctrl.getReport.bind(ctrl));

/**
 * @swagger
 * /api/v1/baby-milestones:
 *   post:
 *     summary: Record or update a baby milestone status (yes / no / almost)
 *     tags: [BabyMilestones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [baby_id, milestone_definition_id, status]
 *             properties:
 *               baby_id:                  { type: integer }
 *               milestone_definition_id:  { type: integer }
 *               status:
 *                 type: string
 *                 enum: [yes, no, almost]
 *               achieved_date: { type: string, format: date }
 *               notes:         { type: string }
 *     responses:
 *       200:
 *         description: Baby milestone upserted
 */
router.post('/', authenticate, ctrl.upsert.bind(ctrl));

/**
 * @swagger
 * /api/v1/baby-milestones/{id}:
 *   delete:
 *     summary: Delete a baby milestone record
 *     tags: [BabyMilestones]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, ctrl.remove.bind(ctrl));

export default router;
