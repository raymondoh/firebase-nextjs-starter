// src/utils/getDisplayName.ts
import type { SerializedActivity } from "@/types/firebase/activity";

/**
 * Returns the best display name from activity metadata or user email
 * Falls back to 'User' if nothing available
 */

/**
 * Returns the best display name for activity logs.
 * Prioritizes:
 * 1. user.name (if provided)
 * 2. metadata.name (from activity)
 * 3. user.email prefix (if available)
 * 4. activity.userEmail prefix
 * 5. Fallback to "User"
 */
export function getDisplayName(activity: SerializedActivity, user?: { name?: string; email?: string }): string {
  return (
    user?.name ?? activity.metadata?.name ?? user?.email?.split("@")[0] ?? activity.userEmail?.split("@")[0] ?? "User"
  );
}
