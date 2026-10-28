import { Request } from 'express';
import { BaseController } from './base.controller';
import { FamilySharingService } from '../services/familySharing.service';

const service = new FamilySharingService();

export class FamilySharingController extends BaseController {
  // POST /api/v1/family/babies/:babyId/invite
  invite = this.handle(async (req: Request, res) => {
    const { email, role = 'viewer' } = req.body;
    const data = await service.inviteMember(
      this.intParam(req, 'babyId'),
      this.userId(req),
      email,
      role,
    );
    this.created(res, data);
  });

  // GET /api/v1/family/babies/:babyId/invitations
  getInvitations = this.handle(async (req: Request, res) => {
    const data = await service.getInvitations(
      this.intParam(req, 'babyId'),
      this.userId(req),
    );
    this.ok(res, data);
  });

  // DELETE /api/v1/family/invitations/:id
  cancelInvitation = this.handle(async (req: Request, res) => {
    await service.cancelInvitation(this.intParam(req, 'id'), this.userId(req));
    this.ok(res, { message: 'Invitation cancelled.' });
  });

  // GET /api/v1/family/invite/:code — public preview (no auth)
  previewInvitation = this.handle(async (req: Request, res) => {
    const data = await service.previewInvitation(req.params.code);
    this.ok(res, data);
  });

  // POST /api/v1/family/invite/:code/accept
  acceptInvitation = this.handle(async (req: Request, res) => {
    const data = await service.acceptInvitation(req.params.code, this.userId(req));
    this.ok(res, data);
  });

  // POST /api/v1/family/invite/:code/decline
  declineInvitation = this.handle(async (req: Request, res) => {
    await service.declineInvitation(req.params.code, this.userId(req));
    this.ok(res, { message: 'Invitation declined.' });
  });

  // GET /api/v1/family/babies/:babyId/members
  getMembers = this.handle(async (req: Request, res) => {
    const data = await service.getMembers(this.intParam(req, 'babyId'), this.userId(req));
    this.ok(res, data);
  });

  // DELETE /api/v1/family/babies/:babyId/members/:userId
  removeMember = this.handle(async (req: Request, res) => {
    await service.removeMember(
      this.intParam(req, 'babyId'),
      this.intParam(req, 'userId'),
      this.userId(req),
    );
    this.ok(res, { message: 'Member removed.' });
  });

  // PATCH /api/v1/family/babies/:babyId/members/:userId
  updateMemberRole = this.handle(async (req: Request, res) => {
    const data = await service.updateMemberRole(
      this.intParam(req, 'babyId'),
      this.intParam(req, 'userId'),
      req.body.role,
      this.userId(req),
    );
    this.ok(res, data);
  });

  // GET /api/v1/family/shared-babies
  getSharedBabies = this.handle(async (req: Request, res) => {
    const data = await service.getSharedBabies(this.userId(req));
    this.ok(res, data);
  });
}
