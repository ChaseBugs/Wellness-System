import type { Program } from "../models/program.js";

export interface IProgramRepository {
  list(): Promise<Program[]>;
}
