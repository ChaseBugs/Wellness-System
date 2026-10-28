import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import crypto from 'crypto';

export class FamilySharingRepository {
  // ─── Invitations ──────────────────────────────────────────────────────────

  async createInvitation(babyId: number, inviterId: number, inviteeEmail: string, role: string) {
    const code = crypto.randomBytes(32).toString('hex');
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      INSERT INTO family_invitations (baby_id, inviter_id, invitee_email, invite_code, role)
      VALUES (${babyId}, ${inviterId}, ${inviteeEmail.toLowerCase()}, ${code}, ${role})
      RETURNING *
    `);
    return rows[0];
  }

  async findInvitationByCode(code: string) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT fi.*, b.name AS baby_name, u.full_name AS inviter_name
      FROM family_invitations fi
      JOIN babies b ON b.id = fi.baby_id
      JOIN users  u ON u.id = fi.inviter_id
      WHERE fi.invite_code = ${code}
    `);
    return rows[0] ?? null;
  }

  async listInvitationsForBaby(babyId: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT id, invitee_email, role, status, expires_at, created_at
      FROM family_invitations
      WHERE baby_id = ${babyId}
      ORDER BY created_at DESC
    `);
    return rows;
  }

  async updateInvitationStatus(id: number, status: string) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      UPDATE family_invitations SET status = ${status} WHERE id = ${id} RETURNING *
    `);
    return rows[0] ?? null;
  }

  async deleteInvitation(id: number, inviterId: number) {
    const result = await prisma.$executeRaw`
      DELETE FROM family_invitations WHERE id = ${id} AND inviter_id = ${inviterId}
    `;
    return result > 0;
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  async addMember(babyId: number, userId: number, role: string, invitedBy: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      INSERT INTO family_members (baby_id, user_id, role, invited_by)
      VALUES (${babyId}, ${userId}, ${role}, ${invitedBy})
      ON CONFLICT (baby_id, user_id) DO UPDATE SET role = EXCLUDED.role
      RETURNING *
    `);
    return rows[0];
  }

  async listMembersForBaby(babyId: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT fm.id, fm.user_id, fm.role, fm.joined_at,
             u.full_name, u.email, u.profile_picture_url,
             inv.full_name AS invited_by_name
      FROM family_members fm
      JOIN users u ON u.id = fm.user_id
      LEFT JOIN users inv ON inv.id = fm.invited_by
      WHERE fm.baby_id = ${babyId}
      ORDER BY fm.joined_at
    `);
    return rows;
  }

  async listBabiesForUser(userId: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT b.id, b.name, b.birth_date, b.gender, b.profile_picture_url,
             fm.role, fm.joined_at,
             u.full_name AS owner_name
      FROM family_members fm
      JOIN babies b ON b.id = fm.baby_id
      JOIN users  u ON u.id = b.user_id
      WHERE fm.user_id = ${userId}
      ORDER BY fm.joined_at
    `);
    return rows;
  }

  async removeMember(babyId: number, userId: number, requesterId: number) {
    const result = await prisma.$executeRaw`
      DELETE FROM family_members
      WHERE baby_id = ${babyId} AND user_id = ${userId}
        AND (
          ${requesterId} IN (SELECT user_id FROM babies WHERE id = ${babyId})
          OR ${requesterId} = ${userId}
        )
    `;
    return result > 0;
  }

  async updateMemberRole(babyId: number, userId: number, role: string, ownerId: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      UPDATE family_members fm
      SET role = ${role}
      FROM babies b
      WHERE fm.baby_id = ${babyId} AND fm.user_id = ${userId}
        AND b.id = ${babyId} AND b.user_id = ${ownerId}
      RETURNING fm.*
    `);
    return rows[0] ?? null;
  }

  async isMember(babyId: number, userId: number) {
    const rows = await prisma.$queryRaw<{ role: string }[]>(Prisma.sql`
      SELECT role FROM family_members WHERE baby_id = ${babyId} AND user_id = ${userId}
    `);
    return rows[0] ?? null;
  }

  async isOwner(babyId: number, userId: number) {
    const count = await prisma.babies.count({ where: { id: babyId, user_id: userId } });
    return count > 0;
  }
}
