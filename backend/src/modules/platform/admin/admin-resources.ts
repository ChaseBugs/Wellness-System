import { defineResource, type ResourceDefinition } from "../../../shared/resource-kit/resource-definition.js";

/**
 * Platform-wide resources for the unified Wellness admin (admins only). Accounts can only have their
 * name and role changed here: sign-up creates them and `DELETE /users/me` deletes them. Purchases and
 * plans are read-only because stores and their notifications own purchase state.
 */
export const accountsResource = defineResource({
  name: "accounts",
  table: "identity.users",
  view: "admin.account_view",
  fields: {
    email: { column: "email", type: "text", readOnly: true },
    displayName: { column: "display_name", type: "text" },
    role: { column: "role", type: "text", enum: ["user", "editor", "admin"] },
    locale: { column: "locale", type: "text", readOnly: true },
    country: { column: "country", type: "text", readOnly: true },
    signupApp: { column: "signup_app", type: "text", readOnly: true },
    apps: { column: "apps", type: "textArray", readOnly: true },
    activePurchases: { column: "active_purchases", type: "integer", readOnly: true },
    marketingOptIn: { column: "marketing_opt_in", type: "boolean", readOnly: true },
    crossAppRecommendations: { column: "cross_app_recommendations", type: "boolean", readOnly: true },
    lastLoginAt: { column: "last_login_at", type: "timestamp", readOnly: true }
  },
  searchFields: ["email", "displayName"],
  filterFields: ["role", "signupApp", "apps"],
  sortFields: ["email", "displayName", "role", "lastLoginAt", "activePurchases"],
  defaultSort: "-createdAt",
  labelField: "email",
  operations: { create: false, delete: false }
});

export const purchasesResource = defineResource({
  name: "purchases",
  table: "billing.purchases",
  view: "admin.purchase_view",
  fields: {
    userId: { column: "user_id", type: "uuid", readOnly: true },
    userEmail: { column: "user_email", type: "text", readOnly: true },
    planCode: { column: "plan_code", type: "text", readOnly: true },
    planName: { column: "plan_name", type: "text", readOnly: true },
    tier: { column: "tier", type: "text", readOnly: true },
    store: { column: "store", type: "text", readOnly: true },
    productId: { column: "product_id", type: "text", readOnly: true },
    originalTransactionId: { column: "original_transaction_id", type: "text", readOnly: true },
    purchasedInApp: { column: "purchased_in_app", type: "text", readOnly: true },
    status: { column: "status", type: "text", readOnly: true },
    autoRenew: { column: "auto_renew", type: "boolean", readOnly: true },
    startedAt: { column: "started_at", type: "timestamp", readOnly: true },
    expiresAt: { column: "expires_at", type: "timestamp", readOnly: true },
    unlocks: { column: "unlocks", type: "textArray", readOnly: true }
  },
  searchFields: ["userEmail", "planCode", "originalTransactionId"],
  filterFields: ["status", "tier", "store", "planCode", "purchasedInApp"],
  sortFields: ["startedAt", "expiresAt", "status", "userEmail"],
  defaultSort: "-startedAt",
  labelField: "planCode",
  operations: { create: false, update: false, delete: false }
});

export const plansResource = defineResource({
  name: "plans",
  table: "billing.plans",
  view: "admin.plan_view",
  fields: {
    code: { column: "code", type: "text", readOnly: true },
    name: { column: "name", type: "text", readOnly: true },
    tier: { column: "tier", type: "text", readOnly: true },
    appCode: { column: "app_code", type: "text", readOnly: true },
    billingPeriod: { column: "billing_period", type: "text", readOnly: true },
    priceUsd: { column: "price_usd", type: "number", readOnly: true },
    isActive: { column: "is_active", type: "boolean", readOnly: true },
    unlocks: { column: "unlocks", type: "textArray", readOnly: true },
    activePurchases: { column: "active_purchases", type: "integer", readOnly: true }
  },
  searchFields: ["code", "name"],
  filterFields: ["tier", "appCode", "isActive"],
  sortFields: ["code", "priceUsd", "activePurchases"],
  defaultSort: "code",
  labelField: "code",
  maxLimit: 500,
  operations: { create: false, update: false, delete: false }
});

export const auditLogsResource = defineResource({
  name: "audit-logs",
  table: "admin.audit_logs",
  view: "admin.audit_log_view",
  fields: {
    resource: { column: "resource", type: "text", readOnly: true },
    action: { column: "action", type: "text", readOnly: true },
    recordIds: { column: "record_ids", type: "textArray", readOnly: true },
    actorEmail: { column: "actor_email", type: "text", readOnly: true },
    requestId: { column: "request_id", type: "text", readOnly: true },
    details: { column: "details", type: "json", readOnly: true }
  },
  searchFields: ["resource", "actorEmail"],
  filterFields: ["resource", "action"],
  sortFields: ["resource", "action"],
  defaultSort: "-createdAt",
  labelField: "resource",
  operations: { create: false, update: false, delete: false }
});

export const PLATFORM_ADMIN_RESOURCES: ResourceDefinition[] = [accountsResource, purchasesResource, plansResource, auditLogsResource];
