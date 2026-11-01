import type { AppCode } from "../../../../config/app-catalog.js";

export interface Reminder {
  id: string;
  userId: string;
  appCode: AppCode;
  title: string;
  body: string | null;
  timeOfDay: string;
  daysOfWeek: number[];
  timezone: string;
  deepLink: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReminderInput {
  title: string;
  body?: string;
  /** Local time "HH:MM" in `timezone`. */
  timeOfDay: string;
  /** 0 = Sunday ... 6 = Saturday. */
  daysOfWeek?: number[];
  timezone?: string;
  deepLink?: string;
  isActive?: boolean;
}

export type UpdateReminderInput = Partial<CreateReminderInput>;

export interface ReminderResponse {
  id: string;
  appCode: AppCode;
  title: string;
  body: string | null;
  timeOfDay: string;
  daysOfWeek: number[];
  timezone: string;
  deepLink: string | null;
  isActive: boolean;
}
