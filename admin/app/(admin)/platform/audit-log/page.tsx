"use client";

import { ResourceManager } from "@/components/ResourceManager";
import { ADMIN_BASES } from "@/lib/api";

const actions = ["create", "update", "delete", "bulk-verify", "bulk-delete", "custom"].map((value) => ({ value, label: value }));

// Every write made through an admin resource in any section is recorded here.
export default function AuditLogPage() {
  return (
    <ResourceManager
      apiBase={ADMIN_BASES.platform}
      title="Audit log"
      description="Who changed what through the admin, across every app. Records cannot be edited."
      endpoint="/audit-logs"
      searchPlaceholder="Search resource or actor email"
      canCreate={false}
      canEdit={false}
      canDelete={false}
      columns={[
        { key: "createdAt", label: "When", kind: "date" },
        { key: "actorEmail", label: "Actor" },
        { key: "resource", label: "Resource" },
        { key: "action", label: "Action" },
        { key: "recordIds", label: "Records" },
        { key: "details", label: "Details" }
      ]}
      fields={[]}
      filters={[{ type: "select", key: "action", label: "Action", options: actions }]}
    />
  );
}
