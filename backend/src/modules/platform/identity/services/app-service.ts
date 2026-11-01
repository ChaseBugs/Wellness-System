import { APP_CATALOG, type AppCode } from "../../../../config/app-catalog.js";
import type { IAppInstallRepository } from "../domain/IAppInstallRepository.js";
import type { AppCatalogResponse } from "../models/app.js";

export class AppService {
  constructor(private appInstallRepository: IAppInstallRepository) {}

  async listCatalog(userId?: string): Promise<AppCatalogResponse[]> {
    const installed = userId ? new Set(await this.appInstallRepository.listCodes(userId)) : null;
    return APP_CATALOG.map((app) => ({
      ...app,
      ...(installed ? { installed: installed.has(app.code) } : {})
    }));
  }

  /** Called by an app on launch so cross-app recommendations know which apps the account already uses. */
  async recordOpen(userId: string, appCode: AppCode): Promise<{ appCode: AppCode; firstTime: boolean }> {
    const { firstTime } = await this.appInstallRepository.touch(userId, appCode);
    return { appCode, firstTime };
  }
}
