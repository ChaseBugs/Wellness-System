export function labelize(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString();
  }
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.name || obj.email) return String(obj.name || obj.email);
    return JSON.stringify(obj);
  }
  return String(value);
}

export function toInputDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}
