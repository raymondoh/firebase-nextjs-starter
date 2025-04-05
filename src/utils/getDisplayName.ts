// src/utils/getDisplayName.ts
import type { SerializedActivity } from "@/types/firebase/activity";

// Function overload signatures
export function getDisplayName(activity: SerializedActivity, user?: { name?: string; email?: string }): string;
export function getDisplayName(name?: string | null, email?: string | null): string;

// Implementation that handles both cases
export function getDisplayName(
  firstParam?: SerializedActivity | string | null,
  secondParam?: { name?: string; email?: string } | string | null
): string {
  // Case 1: Called with (activity, user) pattern
  if (firstParam && typeof firstParam === "object" && "userEmail" in firstParam) {
    const activity = firstParam as SerializedActivity;
    const user = secondParam as { name?: string; email?: string } | undefined;

    return (
      user?.name ?? activity.metadata?.name ?? user?.email?.split("@")[0] ?? activity.userEmail?.split("@")[0] ?? "User"
    );
  }

  // Case 2: Called with (name, email) pattern
  const name = firstParam as string | undefined | null;
  const email = secondParam as string | undefined | null;

  if (name) return name;
  if (email) return email.split("@")[0];
  return "User";
}
