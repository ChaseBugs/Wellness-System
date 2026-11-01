import type { AppCode } from "../../../../config/app-catalog.js";
import type { AppInstall } from "../models/app.js";

export interface IAppInstallRepository {
  /** Upserts the install and reports whether this is the account's first time in the app. */
  touch(userId: string, appCode: AppCode): Promise<{ firstTime: boolean }>;
  listForUser(userId: string): Promise<AppInstall[]>;
  listCodes(userId: string): Promise<AppCode[]>;
}
