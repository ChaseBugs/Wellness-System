import type { CreateUserInput, UpdateUserInput, User } from "../models/user.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  recordLogin(id: string): Promise<void>;
  delete(id: string): Promise<boolean>;
}
