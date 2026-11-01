import type { AppCode } from "../../../../config/app-catalog.js";
import { ConflictError, NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { IReminderRepository } from "../domain/IReminderRepository.js";
import type { CreateReminderInput, Reminder, ReminderResponse, UpdateReminderInput } from "../models/reminder.js";

// Guards against notification spam, which hurts retention more than it helps.
const MAX_REMINDERS_PER_APP = 20;

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Stores reminder schedules per app. Delivery (a scheduler that pushes through FCM/APNs to
 * notify.devices) is not part of this backend yet.
 */
export class ReminderService {
  constructor(private reminderRepository: IReminderRepository) {}

  async list(userId: string, appCode: AppCode): Promise<ReminderResponse[]> {
    const reminders = await this.reminderRepository.listForUser(userId, appCode);
    return reminders.map((reminder) => this.toResponse(reminder));
  }

  async create(userId: string, appCode: AppCode, input: CreateReminderInput): Promise<ReminderResponse> {
    this.assertTimezone(input.timezone);
    if ((await this.reminderRepository.countForUser(userId, appCode)) >= MAX_REMINDERS_PER_APP) {
      throw new ConflictError(`At most ${MAX_REMINDERS_PER_APP} reminders per app`, "REMINDER_LIMIT");
    }
    return this.toResponse(await this.reminderRepository.create(userId, appCode, input));
  }

  async update(userId: string, appCode: AppCode, id: string, input: UpdateReminderInput): Promise<ReminderResponse> {
    this.assertTimezone(input.timezone);
    const reminder = await this.reminderRepository.update(id, userId, appCode, input);
    if (!reminder) throw new NotFoundError("Reminder");
    return this.toResponse(reminder);
  }

  async delete(userId: string, appCode: AppCode, id: string): Promise<void> {
    if (!(await this.reminderRepository.delete(id, userId, appCode))) throw new NotFoundError("Reminder");
  }

  private assertTimezone(timezone?: string): void {
    if (timezone !== undefined && !isValidTimezone(timezone)) throw new ValidationError(`Unknown timezone: ${timezone}`);
  }

  private toResponse(reminder: Reminder): ReminderResponse {
    return {
      id: reminder.id,
      appCode: reminder.appCode,
      title: reminder.title,
      body: reminder.body,
      timeOfDay: reminder.timeOfDay,
      daysOfWeek: reminder.daysOfWeek,
      timezone: reminder.timezone,
      deepLink: reminder.deepLink,
      isActive: reminder.isActive
    };
  }
}
