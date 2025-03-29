// src/utils/date-client.ts
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
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatDate(date: SupportedClientDate): string {
  const dateObj = toDate(date);
  if (!dateObj || isNaN(dateObj.getTime())) return "Invalid date";

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  const ONE_MIN = 60 * 1000;
  const ONE_HOUR = 60 * ONE_MIN;
  const ONE_DAY = 24 * ONE_HOUR;
  const ONE_MONTH = 30 * ONE_DAY;

  if (diff < ONE_MIN) return "Just now";
  if (diff < ONE_HOUR) return `${Math.floor(diff / ONE_MIN)} minute(s) ago`;
  if (diff < ONE_DAY) return `${Math.floor(diff / ONE_HOUR)} hour(s) ago`;
  if (diff < ONE_MONTH) return `${Math.floor(diff / ONE_DAY)} day(s) ago`;

  // For anything older than ~30 days → return absolute format
  return dateObj.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }); // e.g., "10 Oct 2025"
}
