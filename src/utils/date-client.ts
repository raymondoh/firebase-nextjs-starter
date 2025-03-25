import { Timestamp as ClientTimestamp } from "firebase/firestore";

export type SupportedClientDate = Date | string | number | ClientTimestamp | null | undefined;

/**
 * Safely parse various timestamp-like values into a Date object.
 */
export function parseDate(date: SupportedClientDate): Date | null {
  if (!date) return null;

  if (date instanceof Date) return date;

  if (typeof date === "string" || typeof date === "number") {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof date === "object" && "toDate" in date && typeof date.toDate === "function") {
    try {
      return date.toDate();
    } catch {
      return null;
    }
  }

  return null;
}

function isFirestoreTimestamp(value: unknown): value is ClientTimestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  );
}

function toDate(value: SupportedClientDate): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;
  if (isFirestoreTimestamp(value)) return value.toDate();
  if (typeof value === "string" || typeof value === "number") return new Date(value);

  return null;
}

export function formatDate(date: SupportedClientDate): string {
  const dateObj = toDate(date);
  if (!dateObj || isNaN(dateObj.getTime())) return "Invalid date";

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} minutes ago`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))} days ago`;

  return dateObj.toLocaleDateString();
}
