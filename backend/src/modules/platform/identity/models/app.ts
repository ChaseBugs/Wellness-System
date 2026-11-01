import type { AppCategory, AppCode, AppLifecycle, DataSensitivity } from "../../../../config/app-catalog.js";

export interface AppInstall {
  userId: string;
  appCode: AppCode;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export interface AppCatalogResponse {
  code: AppCode;
  name: string;
  category: AppCategory;
  dataSensitivity: DataSensitivity;
  lifecycle: AppLifecycle;
  backendModule: boolean;
  wellnessPassEligible: boolean;
  installed?: boolean;
}

export interface AppInstallResponse {
  appCode: AppCode;
  name: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
}
