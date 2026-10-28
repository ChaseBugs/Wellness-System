"use client";

import { Check, ShieldOff, Trash2, X } from "lucide-react";
import type { BulkAction } from "@/lib/resourceConfigs";

export default function BulkActionBar({
  selectedCount, actions, onAction, onClear
}: { selectedCount: number; actions: BulkAction[]; onAction: (a: BulkAction) => void; onClear: () => void }) {
  if (selectedCount === 0) return null;
  return (
    <div className="bulk-action-bar" role="region" aria-label="Bulk actions">
      <span className="bulk-count"><strong>{selectedCount}</strong> selected</span>
      {actions.includes("verify") ? (
        <button className="primary" type="button" onClick={() => onAction("verify")}><Check size={16} /> Mark verified</button>
      ) : null}
      {actions.includes("unverify") ? (
        <button type="button" onClick={() => onAction("unverify")}><ShieldOff size={16} /> Mark unverified</button>
      ) : null}
      {actions.includes("delete") ? (
        <button type="button" className="danger" onClick={() => onAction("delete")}><Trash2 size={16} /> Delete</button>
      ) : null}
      <button type="button" className="bulk-clear" onClick={onClear}><X size={16} /> Clear</button>
    </div>
  );
}
