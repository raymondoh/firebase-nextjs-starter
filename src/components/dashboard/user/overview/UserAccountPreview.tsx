// // components/user/overview/UserAccountPreview.tsx
// "use client";

// import { AccountSummary } from "./AccountSummary";
// import type { AccountSummaryClientProps } from "@/types/dashboard";
// import type { User } from "@/types/user";
// import { parseDate } from "@/utils";

// export function UserAccountPreview({ userData }: AccountSummaryClientProps) {
//   const user: User = {
//     ...userData,
//     createdAt: parseDate(userData.createdAt) ?? undefined,
//     updatedAt: parseDate(userData.updatedAt) ?? undefined,
//     lastLoginAt: parseDate(userData.lastLoginAt) ?? undefined
//   };

//   return <AccountSummary user={user} profileUrl="/user/profile" />;
// }
// src/components/user/overview/UserAccountPreview.tsx
"use client";

import { AccountSummary } from "./AccountSummary";
import { AccountSummarySkeleton } from "./AccountSummarySkeleton";
import type { AccountSummaryClientProps } from "@/types/dashboard";
import type { User } from "@/types/user";
import { parseDate } from "@/utils";

type Props = {
  serializedUserData: AccountSummaryClientProps["userData"];
  isLoading?: boolean;
};

export function UserAccountPreview({ serializedUserData, isLoading = false }: Props) {
  if (isLoading || !serializedUserData) {
    return <AccountSummarySkeleton />;
  }

  const user: User = {
    ...serializedUserData,
    createdAt: parseDate(serializedUserData.createdAt) ?? undefined,
    updatedAt: parseDate(serializedUserData.updatedAt) ?? undefined,
    lastLoginAt: parseDate(serializedUserData.lastLoginAt) ?? undefined
  };

  return <AccountSummary user={user} profileUrl="/user/profile" />;
}
