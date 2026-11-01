import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { ICareLogRepository } from "../domain/ICareLogRepository.js";
import type { CareLog, CareLogType } from "../models/care-log.js";
import type {
  DiaperInput,
  DiaperResponse,
  FeedingInput,
  FeedingResponse,
  SleepInput,
  SleepResponse
} from "../models/care-view.js";
import type { ChildService } from "./child-service.js";

const ML_PER_OZ = 29.5735;
const LIST_LIMIT = 200;

function minutesBetween(start: Date, end: Date | null): number | null {
  return end ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000) : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Feeding, sleep and diaper screens on top of the generic care log (one table, typed `details`). */
export class CareViewService {
  constructor(
    private careLogRepository: ICareLogRepository,
    private childService: ChildService
  ) {}

  async feedings(userId: string, childId: string, from?: string, to?: string): Promise<FeedingResponse[]> {
    return (await this.list(userId, childId, "feeding", from, to)).map((log) => this.toFeeding(log));
  }

  async addFeeding(userId: string, childId: string, input: FeedingInput): Promise<FeedingResponse> {
    this.assertRange(input.startTime, input.endTime);
    const log = await this.create(userId, childId, {
      logType: "feeding",
      startedAt: input.startTime,
      endedAt: input.endTime,
      details: { feedingType: input.feedingType, amountMl: input.amountMl, side: input.side },
      notes: input.notes
    });
    return this.toFeeding(log);
  }

  async sleeps(userId: string, childId: string, from?: string, to?: string): Promise<SleepResponse[]> {
    return (await this.list(userId, childId, "sleep", from, to)).map((log) => this.toSleep(log));
  }

  async addSleep(userId: string, childId: string, input: SleepInput): Promise<SleepResponse> {
    this.assertRange(input.startTime, input.endTime);
    const log = await this.create(userId, childId, {
      logType: "sleep",
      startedAt: input.startTime,
      endedAt: input.endTime,
      details: { sleepType: input.sleepType, qualityRating: input.qualityRating },
      notes: input.notes
    });
    return this.toSleep(log);
  }

  async diapers(userId: string, childId: string, from?: string, to?: string): Promise<DiaperResponse[]> {
    return (await this.list(userId, childId, "diaper", from, to)).map((log) => this.toDiaper(log));
  }

  async addDiaper(userId: string, childId: string, input: DiaperInput): Promise<DiaperResponse> {
    this.assertRange(input.changeTime);
    const log = await this.create(userId, childId, {
      logType: "diaper",
      startedAt: input.changeTime,
      details: { diaperType: input.diaperType },
      notes: input.notes
    });
    return this.toDiaper(log);
  }

  private async list(userId: string, childId: string, logType: CareLogType, from?: string, to?: string): Promise<CareLog[]> {
    await this.childService.requireAccess(userId, childId, "viewer");
    const { items } = await this.careLogRepository.list(childId, { logType, from, to, page: 1, limit: LIST_LIMIT, offset: 0 });
    return items;
  }

  private async create(userId: string, childId: string, input: Parameters<ICareLogRepository["create"]>[2]): Promise<CareLog> {
    await this.childService.requireAccess(userId, childId, "editor");
    const log = await this.careLogRepository.create(childId, userId, input);
    if (!log) throw new NotFoundError("Care log");
    return log;
  }

  private assertRange(start: string, end?: string): void {
    if (Date.parse(start) > Date.now() + 5 * 60 * 1000) throw new ValidationError("Start time cannot be in the future");
    if (end && Date.parse(end) < Date.parse(start)) throw new ValidationError("End time must be after start time");
  }

  private toFeeding(log: CareLog): FeedingResponse {
    const amountMl = number(log.details.amountMl);
    return {
      id: log.id,
      childId: log.childId,
      feedingType: text(log.details.feedingType) ?? text(log.details.method) ?? "bottle",
      feedingDate: new Date(log.startedAt).toISOString().slice(0, 10),
      startTime: log.startedAt,
      endTime: log.endedAt,
      durationMinutes: minutesBetween(log.startedAt, log.endedAt),
      amountMl,
      amountOz: amountMl === null ? null : Math.round((amountMl / ML_PER_OZ) * 10) / 10,
      side: text(log.details.side),
      notes: log.notes,
      createdAt: log.createdAt
    };
  }

  private toSleep(log: CareLog): SleepResponse {
    return {
      id: log.id,
      childId: log.childId,
      sleepType: text(log.details.sleepType) ?? "nap",
      startTime: log.startedAt,
      endTime: log.endedAt,
      durationMinutes: minutesBetween(log.startedAt, log.endedAt),
      qualityRating: number(log.details.qualityRating),
      notes: log.notes,
      createdAt: log.createdAt
    };
  }

  private toDiaper(log: CareLog): DiaperResponse {
    return {
      id: log.id,
      childId: log.childId,
      diaperType: text(log.details.diaperType) ?? text(log.details.kind) ?? "wet",
      changeTime: log.startedAt,
      notes: log.notes,
      createdAt: log.createdAt
    };
  }
}
