import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import { toPage, type Page } from "../../../../utils/pagination.js";
import type { ICareLogRepository } from "../domain/ICareLogRepository.js";
import type {
  CareDaySummaryResponse,
  CareLog,
  CareLogQuery,
  CareLogResponse,
  CreateCareLogInput,
  UpdateCareLogInput
} from "../models/care-log.js";
import type { ChildService } from "./child-service.js";

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export class CareLogService {
  constructor(
    private careLogRepository: ICareLogRepository,
    private childService: ChildService
  ) {}

  async list(userId: string, childId: string, query: CareLogQuery): Promise<Page<CareLogResponse>> {
    await this.childService.requireAccess(userId, childId, "viewer");
    const { items, total } = await this.careLogRepository.list(childId, query);
    return toPage(items, total, query, (log) => this.toResponse(log));
  }

  async create(userId: string, childId: string, input: CreateCareLogInput): Promise<CareLogResponse> {
    await this.childService.requireAccess(userId, childId, "editor");
    this.assertTimes(input.startedAt, input.endedAt);
    this.assertDetails(input.details);
    return this.toResponse(await this.careLogRepository.create(childId, userId, input));
  }

  async update(userId: string, childId: string, id: string, input: UpdateCareLogInput): Promise<CareLogResponse> {
    await this.childService.requireAccess(userId, childId, "editor");
    if (input.startedAt && input.endedAt) this.assertTimes(input.startedAt, input.endedAt);
    this.assertDetails(input.details);
    const log = await this.careLogRepository.update(id, childId, input);
    if (!log) throw new NotFoundError("Care log");
    return this.toResponse(log);
  }

  async delete(userId: string, childId: string, id: string): Promise<void> {
    await this.childService.requireAccess(userId, childId, "editor");
    if (!(await this.careLogRepository.delete(id, childId))) throw new NotFoundError("Care log");
  }

  async daySummary(userId: string, childId: string, date: string, timezone: string): Promise<CareDaySummaryResponse> {
    await this.childService.requireAccess(userId, childId, "viewer");
    if (!isValidTimezone(timezone)) throw new ValidationError(`Unknown timezone: ${timezone}`);
    return this.careLogRepository.daySummary(childId, date, timezone);
  }

  private assertTimes(startedAt: string, endedAt?: string): void {
    if (Date.parse(startedAt) > Date.now() + 5 * 60 * 1000) throw new ValidationError("startedAt cannot be in the future");
    if (endedAt && Date.parse(endedAt) < Date.parse(startedAt)) throw new ValidationError("endedAt must be after startedAt");
  }

  private assertDetails(details?: Record<string, unknown>): void {
    if (details?.amountMl !== undefined && (typeof details.amountMl !== "number" || details.amountMl < 0 || details.amountMl > 2000)) {
      throw new ValidationError("details.amountMl must be a number between 0 and 2000");
    }
  }

  private toResponse(log: CareLog): CareLogResponse {
    const durationMinutes = log.endedAt
      ? Math.round((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 60000)
      : null;
    return {
      id: log.id,
      logType: log.logType,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      durationMinutes,
      details: log.details,
      notes: log.notes
    };
  }
}
