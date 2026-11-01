import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, type ColumnMap } from "../../../../utils/sql.js";
import type { IUserRepository } from "../domain/IUserRepository.js";
import type { CreateUserInput, UpdateUserInput, User } from "../models/user.js";

const CREATE_COLUMNS: ColumnMap<CreateUserInput> = {
  email: "email",
  passwordHash: "password_hash",
  displayName: "display_name",
  locale: "locale",
  country: "country",
  timezone: "timezone",
  signupApp: "signup_app"
};

const UPDATE_COLUMNS: ColumnMap<UpdateUserInput> = {
  displayName: "display_name",
  locale: "locale",
  country: "country",
  timezone: "timezone",
  marketingOptIn: "marketing_opt_in",
  crossAppRecommendations: "cross_app_recommendations"
};

export class UserRepository implements IUserRepository {
  constructor(private pool: pg.Pool) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query("SELECT * FROM identity.users WHERE id = $1", [id]);
    return result.rows[0] ? camelizeRow<User>(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query("SELECT * FROM identity.users WHERE lower(email) = lower($1)", [email]);
    return result.rows[0] ? camelizeRow<User>(result.rows[0]) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { text, values } = buildInsert("identity.users", input, CREATE_COLUMNS);
    const result = await this.pool.query(text, values);
    return camelizeRow<User>(result.rows[0]);
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const query = buildUpdate("identity.users", input, UPDATE_COLUMNS, { id });
    if (!query) return this.findById(id);
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<User>(result.rows[0]) : null;
  }

  async recordLogin(id: string): Promise<void> {
    await this.pool.query("UPDATE identity.users SET last_login_at = now() WHERE id = $1", [id]);
  }

  async delete(id: string): Promise<boolean> {
    // Every app schema references identity.users with ON DELETE CASCADE, so this erases the account everywhere.
    const result = await this.pool.query("DELETE FROM identity.users WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
