"use client";

import { AccountSummary } from "./AccountSummary";
import type { AccountSummaryClientProps } from "@/types/dashboard";
import type { User } from "@/types/user";

export function AccountSummaryClient({ userData }: AccountSummaryClientProps) {
  // Convert serialized user data back to a format compatible with AccountSummary
  const convertToUserFormat = (serializedUser: any): User => {
    // Create a new object to avoid mutating the original
    const user: User = {
      ...serializedUser
    };

    // Convert ISO date strings back to Date objects if they exist
    if (serializedUser.createdAt) {
      try {
        user.createdAt = new Date(serializedUser.createdAt);
      } catch (error) {
        console.error("Error parsing createdAt date:", error);
      }
    }

    if (serializedUser.lastLoginAt) {
      try {
        user.lastLoginAt = new Date(serializedUser.lastLoginAt);
      } catch (error) {
        console.error("Error parsing lastLoginAt date:", error);
      }
    }

    if (serializedUser.updatedAt) {
      try {
        user.updatedAt = new Date(serializedUser.updatedAt);
      } catch (error) {
        console.error("Error parsing updatedAt date:", error);
      }
    }

    return user;
  };

  const user = convertToUserFormat(userData);

  return <AccountSummary user={user} profileUrl="/user/profile" />;
}
