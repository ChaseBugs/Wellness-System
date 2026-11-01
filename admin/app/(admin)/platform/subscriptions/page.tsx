"use client";

import { useState } from "react";
import { ResourceManager } from "@/components/ResourceManager";
import { ADMIN_BASES } from "@/lib/api";

const options = (values: string[]) => values.map((value) => ({ value, label: value }));

// Read-only: the stores and their server notifications own purchase state.
export default function SubscriptionsPage() {
  const [tab, setTab] = useState<"purchases" | "plans">("purchases");

  return (
    <section>
      <div className="tab-row">
        <button className={`filter-chip ${tab === "purchases" ? "active" : ""}`} onClick={() => setTab("purchases")} type="button">Purchases</button>
        <button className={`filter-chip ${tab === "plans" ? "active" : ""}`} onClick={() => setTab("plans")} type="button">Plans</button>
      </div>
      {tab === "purchases" ? (
        <ResourceManager
          key="purchases"
          apiBase={ADMIN_BASES.platform}
          title="Purchases"
          description="App Pro and Wellness Pass purchases, verified server-side. A purchase made in any app unlocks the apps listed in Unlocks everywhere."
          endpoint="/purchases"
          searchPlaceholder="Search email, plan or transaction id"
          canCreate={false}
          canEdit={false}
          canDelete={false}
          columns={[
            { key: "userEmail", label: "Account" },
            { key: "planCode", label: "Plan" },
            { key: "tier", label: "Tier" },
            { key: "store", label: "Store" },
            { key: "status", label: "Status" },
            { key: "purchasedInApp", label: "Bought in" },
            { key: "unlocks", label: "Unlocks" },
            { key: "startedAt", label: "Started", kind: "date" },
            { key: "expiresAt", label: "Expires", kind: "date" }
          ]}
          fields={[]}
          filters={[
            { type: "select", key: "status", label: "Status", options: options(["active", "grace_period", "expired", "refunded", "revoked"]) },
            { type: "select", key: "tier", label: "Tier", options: options(["app_pro", "wellness_pass"]) },
            { type: "select", key: "store", label: "Store", options: options(["apple", "google", "dev"]) }
          ]}
        />
      ) : (
        <ResourceManager
          key="plans"
          apiBase={ADMIN_BASES.platform}
          title="Plans"
          description="Plan catalog. App Pro unlocks one app; Wellness Pass unlocks every eligible app."
          endpoint="/plans"
          searchPlaceholder="Search plans"
          canCreate={false}
          canEdit={false}
          canDelete={false}
          columns={[
            { key: "code", label: "Code" },
            { key: "name", label: "Name" },
            { key: "tier", label: "Tier" },
            { key: "billingPeriod", label: "Period" },
            { key: "priceUsd", label: "USD" },
            { key: "unlocks", label: "Unlocks" },
            { key: "activePurchases", label: "Active" },
            { key: "isActive", label: "On sale", kind: "boolean" }
          ]}
          fields={[]}
          filters={[{ type: "select", key: "tier", label: "Tier", options: options(["app_pro", "wellness_pass"]) }]}
        />
      )}
    </section>
  );
}
