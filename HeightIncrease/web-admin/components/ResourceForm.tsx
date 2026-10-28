"use client";

import { FormEvent, useMemo } from "react";
import { ResourceConfig, ResourceField } from "@/lib/resources";
import { toInputDate } from "@/lib/format";

type Props = {
  config: ResourceConfig;
  item?: Record<string, unknown> | null;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
};

function defaultValue(field: ResourceField) {
  if (field.type === "checkbox") return false;
  if (field.type === "json") return [];
  return "";
}

function fieldValue(field: ResourceField, item?: Record<string, unknown> | null) {
  const value = item?.[field.key] ?? defaultValue(field);
  if (field.type === "json") return JSON.stringify(value, null, 2);
  if (field.type === "datetime-local") return toInputDate(value);
  return String(value);
}

function FieldInput({ field, item }: { field: ResourceField; item?: Record<string, unknown> | null }) {
  const value = fieldValue(field, item);
  const className = `field ${field.wide ? "wide" : ""}`;

  if (field.type === "checkbox") {
    return (
      <div className={className}>
        <label>{field.label}</label>
        <select defaultValue={value === "true" ? "true" : "false"} name={field.key} data-type="checkbox">
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  if (field.type.startsWith("select:")) {
    const options = field.type.slice(7).split(",");
    return (
      <div className={className}>
        <label>{field.label}</label>
        <select defaultValue={value} name={field.key} required={field.required}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "json") {
    return (
      <div className={className}>
        <label>{field.label}</label>
        <textarea defaultValue={value} name={field.key} data-type={field.type} required={field.required} />
        {field.help ? <small>{field.help}</small> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <label>{field.label}</label>
      <input defaultValue={value} name={field.key} required={field.required} type={field.type} />
      {field.help ? <small>{field.help}</small> : null}
    </div>
  );
}

export default function ResourceForm({ config, item, onCancel, onSubmit }: Props) {
  const title = useMemo(() => (item ? `Edit ${config.title}` : `Add ${config.title}`), [config.title, item]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload: Record<string, unknown> = {};

    for (const element of Array.from(form.elements) as HTMLInputElement[]) {
      if (!element.name) continue;
      if (element.value === "" && element.type !== "password") continue;

      const dataType = element.dataset.type;
      if (dataType === "json") {
        payload[element.name] = element.value ? JSON.parse(element.value) : [];
      } else if (dataType === "checkbox") {
        payload[element.name] = element.value === "true";
      } else if (element.type === "number") {
        payload[element.name] = Number(element.value);
      } else {
        payload[element.name] = element.value;
      }
    }

    await onSubmit(payload);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="panel-head">
          <h2>{title}</h2>
          <button className="btn small ghost" onClick={onCancel} type="button">
            Close
          </button>
        </div>
        <div className="form-grid">
          {config.fields.map((field) => (
            <FieldInput field={field} item={item} key={field.key} />
          ))}
        </div>
        <div className="modal-actions panel-body">
          <button className="btn" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
