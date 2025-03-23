import { Timestamp as ClientTimestamp } from "firebase/firestore";
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

export type SupportedDate = Date | string | number | ClientTimestamp | AdminTimestamp | null | undefined;

export function formatDate(date: SupportedDate): string {
  if (!date) return "N/A";

  const dateObj =
    date instanceof Date
      ? date
      : (date as any)?.toDate && typeof (date as any)?.toDate === "function"
      ? (date as { toDate: () => Date }).toDate()
      : new Date(date);

  if (isNaN(dateObj.getTime())) return "Invalid date";

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} minutes ago`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))} days ago`;

  return dateObj.toLocaleDateString();
}
