import type { IProgramRepository } from "../domain/IProgramRepository.js";
import type { ProgramResponse } from "../models/program.js";

/** Onboarding/coaching program steps shown in the Foodvisor app. */
export class ProgramService {
  constructor(private programRepository: IProgramRepository) {}

  async list(): Promise<ProgramResponse[]> {
    return this.programRepository.list();
  }
}
