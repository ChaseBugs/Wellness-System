import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name?: string;
  phone_number?: string;
  gender?: string;
  birthdate?: Date;
  profile_picture_url?: string;
  language_preference?: string;
  role?: string;
  is_premium?: boolean;
  relation_to_baby?: string;
  active_baby_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithBabies extends Omit<User, 'password_hash'> {
  babies: {
    id: number;
    name: string;
    birth_date: string;
    gender?: string;
    birth_weight_kg?: number;
    birth_height_cm?: number;
    profile_picture_url?: string;
  }[];
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { email } });
    return user as User | null;
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { id } });
    return user as User | null;
  }

  async create(userData: {
    email: string;
    password_hash: string;
    full_name?: string;
  }): Promise<User> {
    const user = await prisma.users.create({
      data: {
        email: userData.email,
        password_hash: userData.password_hash,
        full_name: userData.full_name ?? null,
      },
    });
    return user as User;
  }

  async createAdmin(userData: {
    email: string;
    password_hash: string;
    full_name?: string;
    role: string;
    is_premium?: boolean;
    relation_to_baby?: string;
  }): Promise<User> {
    const user = await prisma.users.create({
      data: {
        email: userData.email,
        password_hash: userData.password_hash,
        full_name: userData.full_name ?? null,
        role: userData.role ?? 'user',
        is_premium: userData.is_premium ?? false,
        relation_to_baby: userData.relation_to_baby ?? null,
      },
    });
    return user as User;
  }

  async update(id: number, updates: Partial<User>): Promise<User> {
    // Strip fields that must not be passed to Prisma update
    const { id: _id, created_at: _created_at, password_hash: _password_hash, ...rest } = updates;

    if (Object.keys(rest).length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }

    const user = await prisma.users.update({
      where: { id },
      data: { ...rest, updated_at: new Date() },
    });
    return user as User;
  }

  async findAll(): Promise<UserWithBabies[]> {
    const rows = await prisma.$queryRaw<UserWithBabies[]>(Prisma.sql`
      SELECT
        u.id, u.email, u.full_name, u.phone_number, u.gender,
        u.birthdate, u.profile_picture_url, u.language_preference,
        u.role, u.is_premium, u.relation_to_baby,
        u.active_baby_id, u.created_at, u.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id',                  b.id,
              'name',                b.name,
              'birth_date',          b.birth_date,
              'gender',              b.gender,
              'birth_weight_kg',     b.birth_weight_kg,
              'birth_height_cm',     b.birth_height_cm,
              'profile_picture_url', b.profile_picture_url
            ) ORDER BY b.created_at
          ) FILTER (WHERE b.id IS NOT NULL),
          '[]'::json
        ) AS babies
      FROM users u
      LEFT JOIN babies b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }

  async setActiveBaby(userId: number, babyId: number | null): Promise<void> {
    await prisma.users.update({
      where: { id: userId },
      data: { active_baby_id: babyId, updated_at: new Date() },
    });
  }

  async createNotificationPreferences(userId: number): Promise<void> {
    await prisma.$executeRaw`INSERT INTO user_notification_preferences (user_id) VALUES (${userId}) ON CONFLICT (user_id) DO NOTHING`;
  }
}
