import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Appointment {
  id: number;
  user_id?: number;
  baby_id?: number;
  pregnancy_id?: number;
  appointment_type: string; // 'doctor', 'ultrasound', 'test', 'other'
  title: string;
  description?: string;
  appointment_date: Date;
  location?: string;
  reminder_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AppointmentRepository {
  async findByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    const where: Prisma.appointmentsWhereInput = { user_id: userId };

    if (startDate || endDate) {
      where.appointment_date = {};
      if (startDate) (where.appointment_date as any).gte = startDate;
      if (endDate) (where.appointment_date as any).lte = endDate;
    }

    const rows = await prisma.appointments.findMany({
      where,
      orderBy: { appointment_date: 'asc' },
    });
    return rows as unknown as Appointment[];
  }

  async findById(id: number, userId: number): Promise<Appointment | null> {
    const row = await prisma.appointments.findFirst({
      where: { id, user_id: userId },
    });
    return row as unknown as Appointment | null;
  }

  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const row = await prisma.appointments.create({
      data: {
        user_id: appointmentData.user_id ?? null,
        baby_id: appointmentData.baby_id ?? null,
        pregnancy_id: appointmentData.pregnancy_id ?? null,
        appointment_type: appointmentData.appointment_type ?? null,
        title: appointmentData.title!,
        description: appointmentData.description ?? null,
        appointment_date: appointmentData.appointment_date!,
        location: appointmentData.location ?? null,
      },
    });
    return row as unknown as Appointment;
  }

  async update(id: number, userId: number, updates: Partial<Appointment>): Promise<Appointment> {
    const allowedFields = ['appointment_type', 'title', 'description', 'appointment_date', 'location'];
    const data: Record<string, any> = { updated_at: new Date() };

    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = (updates as any)[key];
      }
    }

    if (Object.keys(data).length === 1) {
      // Only updated_at — no real changes
      const appointment = await this.findById(id, userId);
      if (!appointment) throw new Error('Appointment not found');
      return appointment;
    }

    const result = await prisma.appointments.updateMany({
      where: { id, user_id: userId },
      data,
    });

    if (result.count === 0) throw new Error('Appointment not found');

    const updated = await this.findById(id, userId);
    return updated!;
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await prisma.appointments.deleteMany({
      where: { id, user_id: userId },
    });
    if (result.count === 0) {
      throw new Error('Appointment not found');
    }
  }
}
