import { Router } from 'express';
import { MilestoneDefinitionController } from '../controllers/milestoneDefinition.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new MilestoneDefinitionController();

/**
 * @swagger
 * tags:
 *   name: MilestoneDefinitions
 *   description: Milestone content library management
 */

/**
 * @swagger
 * /api/v1/milestone-definitions/month/{month}:
 *   get:
 *     summary: Get all milestone definitions for a specific month (mobile)
 *     tags: [MilestoneDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Baby age in months (1–72)
 *     responses:
 *       200:
 *         description: Milestone definitions grouped by type
 */
router.get('/month/:month', authenticate, ctrl.getByMonth.bind(ctrl));

/**
 * @swagger
 * /api/v1/milestone-definitions:
 *   get:
 *     summary: List milestone definitions (admin, filterable)
 *     tags: [MilestoneDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: milestone_type
 *         schema:
 *           type: string
 *           enum: [physical, cognitive, communication, social_emotional]
 *     responses:
 *       200:
 *         description: List of milestone definitions
 */
router.get('/', authenticate, ctrl.list.bind(ctrl));

/**
 * @swagger
 * /api/v1/milestone-definitions/{id}:
 *   get:
 *     summary: Get a single milestone definition
 *     tags: [MilestoneDefinitions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, ctrl.getOne.bind(ctrl));

/**
 * @swagger
 * /api/v1/milestone-definitions:
 *   post:
 *     summary: Create a milestone definition (admin)
 *     tags: [MilestoneDefinitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [month, milestone_type, title, description]
 *             properties:
 *               month:          { type: integer }
 *               milestone_type: { type: string }
 *               title:          { type: string }
 *               description:    { type: string }
 *               question:       { type: string }
 *               related_activity: { type: string }
 *               display_order:  { type: integer }
 *     responses:
 *       201:
 *         description: Milestone definition created
 */
router.post('/', authenticate, ctrl.create.bind(ctrl));

/**
 * @swagger
 * /api/v1/milestone-definitions/{id}:
 *   put:
 *     summary: Update a milestone definition (admin)
 *     tags: [MilestoneDefinitions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, ctrl.update.bind(ctrl));

/**
 * @swagger
 * /api/v1/milestone-definitions/{id}:
 *   delete:
 *     summary: Delete a milestone definition (admin)
 *     tags: [MilestoneDefinitions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, ctrl.remove.bind(ctrl));

export default router;
