import type { ResourceDefinition, ResourceRecord } from "../../../../shared/resource-kit/resource-definition.js";
import type { ResourceActor, ResourceService } from "../../../../shared/resource-kit/resource-service.js";
import { ForbiddenError } from "../../../../utils/errors.js";
import type { IAdminOverviewRepository } from "../domain/IAdminOverviewRepository.js";
import type { AdminOverviewResponse } from "../models/admin-overview.js";

export class PlatformAdminService {
  constructor(
    private overviewRepository: IAdminOverviewRepository,
    private resourceService: ResourceService,
    private accounts: ResourceDefinition
  ) {}

  overview(): Promise<AdminOverviewResponse> {
    return this.overviewRepository.overview();
  }

  /** Admins cannot change their own role, so the last admin can never lock everyone out. */
  async updateAccount(id: string, body: unknown, actor: ResourceActor): Promise<ResourceRecord> {
    const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
    if (input.role !== undefined && id === actor.id) throw new ForbiddenError("You cannot change your own role");
    return this.resourceService.update(this.accounts, id, input, actor);
  }
}
