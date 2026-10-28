import { Router } from 'express';
import { FamilySharingController } from '../controllers/familySharing.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new FamilySharingController();

/**
 * @swagger
 * tags:
 *   name: Family Sharing
 *   description: Share baby profiles with family members
 */

// ─── Invite ───────────────────────────────────────────────────────────────────
// POST   /api/v1/family/babies/:babyId/invite        — send invitation by email
// GET    /api/v1/family/babies/:babyId/invitations   — list pending invitations
// DELETE /api/v1/family/invitations/:id              — cancel invitation

router.post('/babies/:babyId/invite',       authenticate, c.invite.bind(c));
router.get('/babies/:babyId/invitations',   authenticate, c.getInvitations.bind(c));
router.delete('/invitations/:id',           authenticate, c.cancelInvitation.bind(c));

// ─── Accept / Decline (by invite code) ────────────────────────────────────────
// GET    /api/v1/family/invite/:code           — preview invitation (public)
// POST   /api/v1/family/invite/:code/accept    — accept invitation
// POST   /api/v1/family/invite/:code/decline   — decline invitation

router.get('/invite/:code',                 c.previewInvitation.bind(c));
router.post('/invite/:code/accept',         authenticate, c.acceptInvitation.bind(c));
router.post('/invite/:code/decline',        authenticate, c.declineInvitation.bind(c));

// ─── Members ──────────────────────────────────────────────────────────────────
// GET    /api/v1/family/babies/:babyId/members         — list members
// DELETE /api/v1/family/babies/:babyId/members/:userId — remove member
// PATCH  /api/v1/family/babies/:babyId/members/:userId — update role

router.get('/babies/:babyId/members',               authenticate, c.getMembers.bind(c));
router.delete('/babies/:babyId/members/:userId',    authenticate, c.removeMember.bind(c));
router.patch('/babies/:babyId/members/:userId',     authenticate, c.updateMemberRole.bind(c));

// ─── Shared Babies ────────────────────────────────────────────────────────────
// GET /api/v1/family/shared-babies  — babies shared with me

router.get('/shared-babies', authenticate, c.getSharedBabies.bind(c));

export default router;
