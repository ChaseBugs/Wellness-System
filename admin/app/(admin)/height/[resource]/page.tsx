"use client";

import { useParams } from "next/navigation";
import { ResourceManager } from "@/components/ResourceManager";
import { ADMIN_BASES } from "@/lib/api";
import { heightResources, routineActions } from "@/lib/height/resources";

export default function HeightResourcePage() {
  const { resource } = useParams<{ resource: string }>();
  const config = heightResources[resource];
  if (!config) return <p className="error">Unknown HeightIncrease resource.</p>;

  return (
    <ResourceManager
      key={resource}
      apiBase={ADMIN_BASES.height}
      title={config.title}
      description={config.description}
      endpoint={config.endpoint}
      searchPlaceholder={config.searchPlaceholder}
      columns={config.columns}
      fields={config.fields}
      filters={config.filters}
      canCreate={config.canCreate ?? true}
      canDelete={config.canDelete ?? true}
      rowActions={config.routinePath ? routineActions(config.routinePath) : []}
    />
  );
}
