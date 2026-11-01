import type { AppCode } from "../../../../config/app-catalog.js";
import type { CreateReminderInput, Reminder, UpdateReminderInput } from "../models/reminder.js";

export interface IReminderRepository {
  listForUser(userId: string, appCode: AppCode): Promise<Reminder[]>;
  countForUser(userId: string, appCode: AppCode): Promise<number>;
  create(userId: string, appCode: AppCode, input: CreateReminderInput): Promise<Reminder>;
  update(id: string, userId: string, appCode: AppCode, input: UpdateReminderInput): Promise<Reminder | null>;
  delete(id: string, userId: string, appCode: AppCode): Promise<boolean>;
}
