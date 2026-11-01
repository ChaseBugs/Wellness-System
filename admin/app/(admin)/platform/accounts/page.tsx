"use client";

import { ResourceManager } from "@/components/ResourceManager";
import { ADMIN_BASES } from "@/lib/api";

const roles = ["user", "editor", "admin"].map((value) => ({ value, label: value }));

// Accounts are created by signing up in any app and deleted by their owner; here admins set names and roles.
export default function AccountsPage() {
  return (
    <ResourceManager
      apiBase={ADMIN_BASES.platform}
      title="Accounts & roles"
      description="One Wellness account works in every app. Editors manage app content; admins also review content and manage accounts. You cannot change your own role."
      endpoint="/accounts"
      searchPlaceholder="Search email or name"
      canCreate={false}
      canDelete={false}
      columns={[
        { key: "email", label: "Email" },
        { key: "displayName", label: "Name" },
        { key: "role", label: "Role" },
        { key: "apps", label: "Apps" },
        { key: "signupApp", label: "Signed up in" },
        { key: "activePurchases", label: "Active subs" },
        { key: "lastLoginAt", label: "Last login", kind: "date" },
        { key: "createdAt", label: "Created", kind: "date" }
      ]}
      fields={[
        { name: "displayName", label: "Display name", type: "text" },
        { name: "role", label: "Role", type: "select", options: ["user", "editor", "admin"], required: true }
      ]}
      filters={[{ type: "select", key: "role", label: "Role", options: roles }]}
      sortable={[
        { value: "-createdAt", label: "Newest" },
        { value: "-lastLoginAt", label: "Last login" },
        { value: "email", label: "Email" }
      ]}
    />
  );
}
