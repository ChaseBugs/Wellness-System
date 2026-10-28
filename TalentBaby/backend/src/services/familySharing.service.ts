import { database } from '../config/database';
import { FamilySharingRepository } from '../repositories/familySharing.repository';

const repo = new FamilySharingRepository();

export class FamilySharingService {
  // ─── Invite ───────────────────────────────────────────────────────────────

  async inviteMember(babyId: number, inviterId: number, inviteeEmail: string, role: 'viewer' | 'editor' = 'viewer') {
    // Verify requester owns the baby
    const owned = await repo.isOwner(babyId, inviterId);
    if (!owned) throw { status: 403, message: 'Only the baby owner can send invitations.' };

    // Don't allow owner to invite themselves
    const inviterRow = await database.query(`SELECT email FROM users WHERE id = $1`, [inviterId]);
    if (inviterRow.rows[0]?.email?.toLowerCase() === inviteeEmail.toLowerCase()) {
      throw { status: 400, message: 'You cannot invite yourself.' };
    }

    const invitation = await repo.createInvitation(babyId, inviterId, inviteeEmail, role);
    return invitation;
  }

  async getInvitations(babyId: number, requesterId: number) {
    const owned = await repo.isOwner(babyId, requesterId);
    if (!owned) throw { status: 403, message: 'Only the baby owner can view invitations.' };
    return repo.listInvitationsForBaby(babyId);
  }

  async cancelInvitation(invitationId: number, requesterId: number) {
    const deleted = await repo.deleteInvitation(invitationId, requesterId);
    if (!deleted) throw { status: 404, message: 'Invitation not found or access denied.' };
  }

  // ─── Accept / Decline ─────────────────────────────────────────────────────

  async acceptInvitation(code: string, userId: number) {
    const inv = await repo.findInvitationByCode(code);
    if (!inv) throw { status: 404, message: 'Invitation not found.' };
    if (inv.status !== 'pending') throw { status: 400, message: `Invitation is already ${inv.status}.` };
    if (new Date(inv.expires_at) < new Date()) {
      await repo.updateInvitationStatus(inv.id, 'expired');
      throw { status: 400, message: 'Invitation has expired.' };
    }

    // Verify the accepting user's email matches
    const userRow = await database.query(`SELECT email FROM users WHERE id = $1`, [userId]);
    if (userRow.rows[0]?.email?.toLowerCase() !== inv.invitee_email.toLowerCase()) {
      throw { status: 403, message: 'This invitation was not sent to your account.' };
    }

    await repo.updateInvitationStatus(inv.id, 'accepted');
    const member = await repo.addMember(inv.baby_id, userId, inv.role, inv.inviter_id);
    return { member, baby_name: inv.baby_name, role: inv.role };
  }

  async declineInvitation(code: string, userId: number) {
    const inv = await repo.findInvitationByCode(code);
    if (!inv) throw { status: 404, message: 'Invitation not found.' };
    if (inv.status !== 'pending') throw { status: 400, message: `Invitation is already ${inv.status}.` };

    const userRow = await database.query(`SELECT email FROM users WHERE id = $1`, [userId]);
    if (userRow.rows[0]?.email?.toLowerCase() !== inv.invitee_email.toLowerCase()) {
      throw { status: 403, message: 'This invitation was not sent to your account.' };
    }

    await repo.updateInvitationStatus(inv.id, 'declined');
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  async getMembers(babyId: number, requesterId: number) {
    const owned = await repo.isOwner(babyId, requesterId);
    const isMember = await repo.isMember(babyId, requesterId);
    if (!owned && !isMember) throw { status: 403, message: 'Access denied.' };
    return repo.listMembersForBaby(babyId);
  }

  async removeMember(babyId: number, targetUserId: number, requesterId: number) {
    const removed = await repo.removeMember(babyId, targetUserId, requesterId);
    if (!removed) throw { status: 404, message: 'Member not found or access denied.' };
  }

  async updateMemberRole(babyId: number, targetUserId: number, role: 'viewer' | 'editor', requesterId: number) {
    const updated = await repo.updateMemberRole(babyId, targetUserId, role, requesterId);
    if (!updated) throw { status: 404, message: 'Member not found or you are not the baby owner.' };
    return updated;
  }

  // ─── Shared Babies ────────────────────────────────────────────────────────

  async getSharedBabies(userId: number) {
    return repo.listBabiesForUser(userId);
  }

  // ─── Invite preview (no auth required — public code lookup) ───────────────
  async previewInvitation(code: string) {
    const inv = await repo.findInvitationByCode(code);
    if (!inv) throw { status: 404, message: 'Invitation not found.' };
    return {
      baby_name:    inv.baby_name,
      inviter_name: inv.inviter_name,
      role:         inv.role,
      status:       inv.status,
      expires_at:   inv.expires_at,
    };
  }
}
